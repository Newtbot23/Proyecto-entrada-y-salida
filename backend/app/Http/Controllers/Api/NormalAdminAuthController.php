<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\Api\Auth\LoginRequest;

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

            // Verify if the user is an Admin (id_rol = 1)
            // Roll map: 1 could be Admin based on user's setup
            if ($user->id_rol != 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Acceso denegado. Solo administradores pueden iniciar sesión aquí.'
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

            // Create Sanctum token
            $token = $user->createToken('admin_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'data' => [
                    'user' => [
                        'id' => $user->doc,
                        'nombre' => $user->primer_nombre . ' ' . $user->primer_apellido,
                        'correo' => $user->correo,
                        'nit_entidad' => $user->nit_entidad,
                        'license_id' => $licencia->id,
                        'license_status' => $licencia->estado,
                        'license_expired' => $licenseExpired
                    ],
                    'token' => $token
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al iniciar sesión',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
