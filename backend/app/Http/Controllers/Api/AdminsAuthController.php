<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admins;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\Api\Admins\LoginRequest;

/**
 * Controller for Admins (SuperAdmin) Authentication
 */
class AdminsAuthController extends Controller
{
    /**
     * Handle an authentication attempt for admins.
     * 
     * @param \App\Http\Requests\Api\Admins\LoginRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(LoginRequest $request)
    {
        // Validation is automatically handled by the LoginRequest

        // Attempt to find the admin by email
        $admin = Admins::where('correo', $request->correo)->first();

        // Check if admin exists and password is correct
        if (!$admin || !Hash::check($request->contrasena, $admin->contrasena)) {
            return response()->json([
                'success' => false,
                'message' => 'Las credenciales proporcionadas son incorrectas.'
            ], 401);
        }

        // Generate token using Sanctum
        $token = $admin->createToken('admin-token')->plainTextToken;

        // Return successful response with token and admin data
        return response()->json([
            'success' => true,
            'message' => 'Inicio de sesión exitoso.',
            'data' => [
                'admin' => $admin,
                'token' => $token
            ]
        ], 200);
    }

    /**
     * Handle logout for admins by revoking the current token.
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sesión cerrada exitosamente.'
        ], 200);
    }
}
