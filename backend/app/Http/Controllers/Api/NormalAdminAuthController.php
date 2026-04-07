<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuarios;
use App\Models\DetalleFichaUsuarios;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\Api\Auth\LoginRequest;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\TwoFactorAuthMail;
use Carbon\Carbon;

class NormalAdminAuthController extends Controller
{
    /**
     * Handle a login request for a Normal Admin.
     * POST /api/normaladmin/login
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            // Find user by email
            $user = Usuarios::where('correo', $request->correo)->first();

            // Verify existence and password
            if (!$user || !Hash::check($request->contrasena, $user->contrasena)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Credenciales inválidas'
                ], 401);
            }

            // Verify if the user is an Admin (id_rol = 1), regular User (id_rol = 2),
            // Puerta Personas (id_rol = 3), or Puerta Vehiculos (id_rol = 4)
            if (!in_array($user->id_rol, [1, 2, 3, 4])) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Usuario no autorizado para esta plataforma.'
                ], 403);
            }

            // Load license relationship (now correctly fetching via nit_entidad)
            $user->load('licenciaSistema');
            $licencia = $user->licenciaSistema;

            if (!$licencia) {
                return response()->json([
                    'success' => false,
                    'message' => 'No hay una licencia asociada a la entidad de este usuario. Contacte a soporte.'
                ], 403);
            }

            $currentDate = now();
            $licenseExpired = false;

            // 1. Check if expired (expirado)
            if ($licencia->fecha_vencimiento < $currentDate) {
                if ($licencia->estado !== 'expirado') {
                    $licencia->update(['estado' => 'expirado']);
                }
                $licenseExpired = true;
            }

            // 2. Validate status (activo, inactivo, expirado, pendiente)
            if ($licencia->estado === 'inactivo') {
                return response()->json([
                    'success' => false,
                    'message' => 'Tu licencia está inactiva. Por favor, contacte a soporte.'
                ], 403);
            }

            // Trigger 2FA logic exclusively for 'Administrador' (id_rol = 1)
            if ($user->id_rol === 1) {
                // Generate 6-digit code
                $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

                // Store code in Cache with a 10-minute expiration
                Cache::put('2fa_normaladmin_' . $user->correo, $code, Carbon::now()->addMinutes(10));

                // Send Email
                Mail::to($user->correo)->send(new TwoFactorAuthMail($code));

                return response()->json([
                    'success' => true,
                    'message' => 'Código de autenticación enviado al correo.',
                    'data' => [
                        'email' => $user->correo,
                        'requires_2fa' => true
                    ]
                ], 200);
            }

            // Create Sanctum token for users that don't need 2FA (id_rol != 1)
            $token = $user->createToken('admin_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'data' => [
                    'user' => [
                        'id' => $user->doc,
                        'nombre' => $user->primer_nombre . ' ' . $user->primer_apellido,
                        'correo' => $user->correo,
                        'id_rol' => $user->id_rol,
                        'nit_entidad' => $user->nit_entidad,
                        'codigo_qr' => $user->codigo_qr,
                        'license_id' => $licencia->id,
                        'license_status' => $licencia->estado,
                        'license_expired' => $licenseExpired,
                        'es_instructor' => DetalleFichaUsuarios::where('doc', $user->doc)
                            ->where('tipo_participante', 'instructor')
                            ->exists()
                    ],
                    'token' => $token
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error al iniciar sesión Normal Admin: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al iniciar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify the 6-digit 2FA code and finalize login for Normal Admin
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify2fa(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'code' => 'required|string|size:6'
            ]);

            // Check code against Cache
            $cacheKey = '2fa_normaladmin_' . $request->email;
            $storedCode = Cache::get($cacheKey);

            if (!$storedCode || $storedCode !== $request->code) {
                return response()->json([
                    'success' => false,
                    'message' => 'El código es inválido o ha expirado.',
                    'errors' => [
                        'code' => ['El código es inválido o ha expirado.']
                    ]
                ], 422);
            }

            // Find the user
            $user = Usuarios::where('correo', $request->email)->first();

            if (!$user || $user->id_rol !== 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso no autorizado.'
                ], 403);
            }

            // Load license relationship
            $user->load('licenciaSistema');
            $licencia = $user->licenciaSistema;

            $currentDate = now();
            $licenseExpired = false;

            if ($licencia && $licencia->fecha_vencimiento < $currentDate) {
                $licenseExpired = true;
            }

            // Delete the used code
            Cache::forget($cacheKey);

            // Generate token
            $token = $user->createToken('admin_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'data' => [
                    'user' => [
                        'id' => $user->doc,
                        'nombre' => $user->primer_nombre . ' ' . $user->primer_apellido,
                        'correo' => $user->correo,
                        'id_rol' => $user->id_rol,
                        'nit_entidad' => $user->nit_entidad,
                        'codigo_qr' => $user->codigo_qr,
                        'license_id' => $licencia ? $licencia->id : null,
                        'license_status' => $licencia ? $licencia->estado : null,
                        'license_expired' => $licenseExpired,
                        'es_instructor' => DetalleFichaUsuarios::where('doc', $user->doc)
                            ->where('tipo_participante', 'instructor')
                            ->exists()
                    ],
                    'token' => $token
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error verifying 2FA normal admin: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar el código.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
