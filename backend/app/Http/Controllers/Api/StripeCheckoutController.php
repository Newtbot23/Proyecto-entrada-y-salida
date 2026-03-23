<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Illuminate\Support\Facades\Log;
use App\Models\LicenciasSistema;
use App\Models\PagosLicencia;
use App\Models\Entidades;

class StripeCheckoutController extends Controller
{
    public function createCheckoutSession(Request $request)
    {
        try {
            $request->validate([
                'licencia_id' => 'required|exists:licencias_sistema,id',
                'tipo_pago' => 'nullable|in:compra,renovacion'
            ]);

            $licenciaId = $request->input('licencia_id');
            $tipoPago = $request->input('tipo_pago', 'compra');

            // Load license with plan and entity relationships
            $licencia = LicenciasSistema::with(['plan', 'entidad'])->find($licenciaId);

            if (!$licencia) {
                return response()->json(['error' => 'Licencia no encontrada'], 404);
            }

            if (!$licencia->plan) {
                return response()->json(['error' => 'La licencia no tiene un plan asignado'], 400);
            }

            // Set Stripe Secret Key from .env
            Stripe::setApiKey(config('services.stripe.secret'));

            // Use plan price (assuming price_plan is in decimal/float format from DB)
            // Stripe expects amount in cents for USD
            $amount = (int) ($licencia->plan->precio_plan * 100); 

            // Get user email from entity
            $customerEmail = $licencia->entidad ? $licencia->entidad->correo : null;

            // Construct the frontend URL base.
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');

            $sessionPayload = [
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => [
                            'name' => 'Licencia: ' . $licencia->plan->nombre_plan,
                            'description' => $licencia->plan->descripcion ?? 'Suscripción de licencia',
                        ],
                        'unit_amount' => $amount,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $frontendUrl . '/payment-success?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => $frontendUrl . '/payment-cancel',
                'metadata' => [
                    'licencia_id' => $licencia->id,
                    'tipo_pago' => $tipoPago
                ]
            ];

            if ($customerEmail) {
                $sessionPayload['customer_email'] = $customerEmail;
            }

            $session = Session::create($sessionPayload);

            return response()->json(['url' => $session->url]);

        } catch (\Exception $e) {
            Log::error('Stripe Checkout Create Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function confirmPayment(Request $request)
    {
        try {
            $request->validate([
                'session_id' => 'required|string'
            ]);

            $sessionId = $request->input('session_id');

            // Check for idempotency: Do not process if already exists
            $existingPayment = PagosLicencia::where('stripe_session_id', $sessionId)->first();
            if ($existingPayment) {
                return response()->json([
                    'success' => true, 
                    'message' => 'Pago ya registrado anteriormente',
                    'data' => $existingPayment
                ]);
            }

            Stripe::setApiKey(config('services.stripe.secret'));
            $session = Session::retrieve($sessionId);

            $estadoPago = 'pendiente';
            if ($session->payment_status === 'paid') {
                $estadoPago = 'pagado';
            } elseif (in_array($session->status, ['expired', 'canceled'])) {
                $estadoPago = 'anulado';
            }

            if ($estadoPago !== 'pagado') {
                return response()->json(['error' => 'El pago no ha sido completado de manera exitosa'], 400);
            }

            $licenciaId = $session->metadata->licencia_id ?? null;
            $tipoPago = $session->metadata->tipo_pago ?? 'compra';

            if (!$licenciaId) {
                Log::error('Stripe Session missing metadata.licencia_id', ['session_id' => $sessionId]);
                return response()->json(['error' => 'Datos de sesión inválidos (licencia_id faltante)'], 400);
            }

            // Create Payment Record
            $pago = PagosLicencia::create([
                'id_licencia' => $licenciaId,
                'fecha_pago' => now(),
                'metodo_pago' => 'tarjeta',
                'referencia' => $session->payment_intent ?? $session->id, // Using payment_intent as reference
                'monto' => $session->amount_total / 100, // Convert cents back to main currency unit
                'stripe_session_id' => $session->id,
                'estado' => $estadoPago,
                'tipo_pago' => $tipoPago,
                'creado_en' => now()
            ]);

            // Update License Status
            if ($estadoPago === 'pagado') {
                $licencia = LicenciasSistema::with('plan')->find($licenciaId);
                if ($licencia) {
                    $licenciaData = [
                        'estado' => 'activo',
                        'fecha_ultima_validacion' => now(),
                        'referencia_pago' => $pago->referencia // Copy reference from payment
                    ];

                    // Si es renovación, recalcular expiración desde la actual
                    if ($tipoPago === 'renovacion' && $licencia->plan) {
                        $currentExp = $licencia->fecha_vencimiento ? \Carbon\Carbon::parse($licencia->fecha_vencimiento) : now();
                        $baseDate = $currentExp->isFuture() ? clone $currentExp : now();
                        
                        if (strtolower($licencia->plan->periodo_facturacion) === 'anual') {
                            $baseDate->addYears($licencia->plan->duracion_plan);
                        } else {
                            $baseDate->addMonths($licencia->plan->duracion_plan);
                        }
                        $licenciaData['fecha_vencimiento'] = $baseDate;
                    }

                    $licencia->update($licenciaData);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Pago confirmado y registrado exitosamente',
                'data' => $pago
            ]);

        } catch (\Exception $e) {
            Log::error('Stripe Payment Confirmation Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
