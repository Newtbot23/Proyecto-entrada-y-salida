<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Admins;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

use App\Http\Requests\Api\Admins\LoginRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use App\Mail\TwoFactorAuthMail;

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

        try {
            // Generate 6-digit code
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Store code in Cache with a 10-minute expiration
            \Illuminate\Support\Facades\Cache::put('2fa_superadmin_' . $admin->correo, $code, Carbon::now()->addMinutes(10));

            // Send Email
            Mail::to($admin->correo)->send(new TwoFactorAuthMail($code));

            return response()->json([
                'success' => true,
                'message' => 'Código de autenticación enviado al correo.',
                'data' => [
                    'email' => $admin->correo,
                    'requires_2fa' => true
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error sending 2FA email: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al generar la autenticación de dos pasos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify the 6-digit 2FA code and finalize login
     * 
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify2fa(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'code' => 'required|string|size:6'
            ]);

            // Check code against Cache
            $cacheKey = '2fa_superadmin_' . $request->email;
            $storedCode = \Illuminate\Support\Facades\Cache::get($cacheKey);

            if (!$storedCode || $storedCode !== $request->code) {
                return response()->json([
                    'success' => false,
                    'message' => 'El código es inválido o ha expirado.',
                    'errors' => [
                        'code' => ['El código es inválido o ha expirado.']
                    ]
                ], 422);
            }

            // Find the admin
            $admin = Admins::where('correo', $request->email)->first();

            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado.'
                ], 401);
            }

            // Delete the used code
            \Illuminate\Support\Facades\Cache::forget($cacheKey);

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

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error verifying 2FA code: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar el código.',
                'error' => $e->getMessage()
            ], 500);
        }
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
