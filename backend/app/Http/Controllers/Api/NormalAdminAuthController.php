<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class NormalAdminAuthController extends Controller
{
    /**
     * Handle a login request for a Normal Admin.
     * POST /api/normaladmin/login
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'correo' => 'required|email',
            'contrasena' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Find user by email
            $user = Usuarios::where('correo', $request->correo)->first();

            // Verify existence and password
            if (!$user || !Hash::check($request->contrasena, $user->contrasena)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials'
                ], 401);
            }

            // Verify if the user is an Admin (id_rol = 1)
            if ($user->id_rol != 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Only administrators can login here.'
                ], 403);
            }

            // Load license relationship
            $user->load('licenciaSistema');
            $licencia = $user->licenciaSistema;

            if (!$licencia) {
                return response()->json([
                    'success' => false,
                    'message' => 'No license associated with this account. Contact support.'
                ], 403);
            }

            $currentDate = now();
            $licenseExpired = false;

            // 1. Check if expired
            if ($licencia->fecha_vencimiento < $currentDate) {
                $licencia->update(['estado' => 'expirado']);
                $licenseExpired = true;
            }

            // 2. Validate status
            if ($licencia->estado === 'inactivo') {
                return response()->json([
                    'success' => false,
                    'message' => 'Your license is inactive. Please contact support.'
                ], 403);
            }

            if ($licencia->estado === 'pendiente' && !$licenseExpired) {
                // If pending, we allow login but frontend should redirect to payment
                // UNLESS business rule says NO LOGIN.
                // User requirement: "If estado == 'pendiente': Redirect to payment page"
                // So we allow login but provide the status.
            }

            // Create Sanctum token
            $token = $user->createToken('admin_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'nombre' => $user->primer_nombre . ' ' . $user->primer_apellido,
                        'correo' => $user->correo,
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
                'message' => 'Login error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
