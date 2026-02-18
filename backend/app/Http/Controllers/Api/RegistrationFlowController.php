<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidades;
use App\Models\LicenciasSistema;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

use App\Http\Requests\Api\Registration\FinishRegistrationRequest;
use Carbon\Carbon;

class RegistrationFlowController extends Controller
{
    /**
     * Handle the complete registration flow in a single transaction (Unified Legacy).
     * POST /api/registration/full
     */
    public function register(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Use complete-entity for the new flow'], 400);
    }

    /**
     * Complete registration for an existing entity: Create License and Admin User.
     * POST /api/registration/complete-entity
     */
    public function finishRegistration(FinishRegistrationRequest $request): JsonResponse
    {
        // Validation is automatically handled by the FinishRegistrationRequest

        // Validation is automatically handled by the FinishRegistrationRequest


        DB::beginTransaction();

        try {
            // 1. Create License (Status = pendiente by default)
            $fechaInicio = Carbon::now();
            $fechaVencimiento = Carbon::now()->addYear();

            $licencia = LicenciasSistema::create([
                'fecha_inicio' => $fechaInicio,
                'fecha_vencimiento' => $fechaVencimiento,
                'estado' => 'pendiente',
                'fecha_ultima_validacion' => $fechaInicio,
                'id_plan_lic' => $request->id_plan_lic,
                'nit_entidad' => $request->id_entidad, // Fixed: Use nit_entidad column
            ]);

            // 2. Create Admin User linked to License
            // Fields order and names are verified against DESCRIBE command result
            $user = Usuarios::create([
                'doc' => $request->doc,
                'id_tip_doc' => $request->id_tip_doc,
                'nit_entidad' => $request->id_entidad,
                'primer_nombre' => $request->primer_nombre,
                'segundo_nombre' => $request->segundo_nombre ?? null,
                'primer_apellido' => $request->primer_apellido,
                'segundo_apellido' => $request->segundo_apellido ?? null,
                'telefono' => $request->user_telefono,
                'correo' => $request->user_correo,
                'contrasena' => Hash::make($request->contrasena),
                'id_rol' => 1, // Admin role
                'estado' => 'activo',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registration completed successfully',
                'data' => [
                    'user' => $user,
                    'licencia' => $licencia
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            // Debug logging
            file_put_contents(storage_path('logs/registration_error.log'), $e->getMessage() . "\n" . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error completing registration: ' . $e->getMessage(), // Temporarily expose error
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }
}
