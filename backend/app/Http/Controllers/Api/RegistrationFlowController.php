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
use Illuminate\Support\Facades\Validator;
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
    public function finishRegistration(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'id_entidad' => 'required|exists:entidades,id',
            'id_plan_lic' => 'required|exists:planes_licencia,id',
            
            // Admin User Data
            'doc' => 'required|string|max:20|unique:usuarios,doc',
            'id_tip_doc' => 'required|exists:tipo_doc,id_tip_doc',
            'primer_nombre' => 'required|string|max:50',
            'primer_apellido' => 'required|string|max:50',
            'user_telefono' => 'required|string|max:13',
            'user_correo' => 'required|email|max:100|unique:usuarios,correo',
            'contrasena' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

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
                'id_entidad' => $request->id_entidad,
            ]);

            // 2. Create Admin User linked to License
            // Fields order and names are verified against DESCRIBE command result
            $user = Usuarios::create([
                'doc' => $request->doc,
                'id_tip_doc' => $request->id_tip_doc,
                'id_licencia_sistema' => $licencia->id,
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
            return response()->json([
                'success' => false,
                'message' => 'Error completing registration',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }
}
