<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admins;
use App\Models\Usuarios;
use App\Mail\RecoveryCodeMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

/**
 * API Controller for Password Recovery
 * 
 * Provides JSON endpoints for React frontend to handle password recovery
 * using a 6-digit code system.
 */
class PasswordRecoveryApiController extends Controller
{
    /**
     * Send recovery code to user's email
     * 
     * POST /api/forgot-password
     * {
     *   "email": "user@example.com",
     *   "type": "usuario" // or "superadmin"
     * }
     */
    public function sendResetCode(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'type' => 'sometimes|in:usuario,superadmin'
            ]);

            $type = $request->input('type', 'usuario');
            $isSuperAdmin = $type === 'superadmin';
            $model = $isSuperAdmin ? Admins::class : Usuarios::class;
            $userType = $isSuperAdmin ? 'admins' : 'usuarios';

            $user = $model::where('correo', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No encontramos un usuario con ese correo electrónico.',
                    'errors' => [
                        'email' => ['No encontramos un usuario con ese correo electrónico.']
                    ]
                ], 422);
            }

            // Generate 6-digit code
            $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Delete any previous codes for this email
            DB::table('password_reset_codes')
                ->where('email', $request->email)
                ->where('user_type', $userType)
                ->delete();

            // Store new code in database
            DB::table('password_reset_codes')->insert([
                'email' => $request->email,
                'code' => $code,
                'user_type' => $userType,
                'created_at' => Carbon::now(),
            ]);

            // Send Email
            Mail::to($request->email)->send(new RecoveryCodeMail($code));

            return response()->json([
                'success' => true,
                'message' => 'Se ha enviado un código de recuperación a tu correo electrónico.',
                'data' => [
                    'email' => $request->email
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error sending recovery email: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al enviar el correo electrónico. Por favor, inténtalo de nuevo más tarde.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify the 6-digit recovery code
     * 
     * POST /api/verify-code
     * {
     *   "email": "user@example.com",
     *   "code": "123456",
     *   "type": "usuario" // or "superadmin"
     * }
     */
    public function verifyCode(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'code' => 'required|string|size:6',
                'type' => 'sometimes|in:usuario,superadmin'
            ]);

            $type = $request->input('type', 'usuario');
            $isSuperAdmin = $type === 'superadmin';
            $userType = $isSuperAdmin ? 'admins' : 'usuarios';

            $record = DB::table('password_reset_codes')
                ->where('email', $request->email)
                ->where('code', $request->code)
                ->where('user_type', $userType)
                ->where('created_at', '>', Carbon::now()->subMinutes(60))
                ->first();

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'El código es inválido o ha expirado.',
                    'errors' => [
                        'code' => ['El código es inválido o ha expirado.']
                    ]
                ], 422);
            }

            return response()->json([
                'success' => true,
                'message' => 'Código verificado correctamente.',
                'data' => [
                    'email' => $request->email,
                    'code' => $request->code,
                    'verified' => true
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error verifying code: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar el código.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset password with verified code
     * 
     * POST /api/reset-password
     * {
     *   "email": "user@example.com",
     *   "code": "123456",
     *   "password": "newpassword123",
     *   "password_confirmation": "newpassword123",
     *   "type": "usuario" // or "superadmin"
     * }
     */
    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'code' => 'required|string|size:6',
                'password' => 'required|min:8|confirmed',
                'type' => 'sometimes|in:usuario,superadmin'
            ]);

            $type = $request->input('type', 'usuario');
            $isSuperAdmin = $type === 'superadmin';
            $model = $isSuperAdmin ? Admins::class : Usuarios::class;
            $userType = $isSuperAdmin ? 'admins' : 'usuarios';

            // Verify code is still valid
            $record = DB::table('password_reset_codes')
                ->where('email', $request->email)
                ->where('code', $request->code)
                ->where('user_type', $userType)
                ->where('created_at', '>', Carbon::now()->subMinutes(60))
                ->first();

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'El código es inválido o ha expirado.',
                    'errors' => [
                        'code' => ['El código es inválido o ha expirado.']
                    ]
                ], 422);
            }

            // Find user
            $user = $model::where('correo', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado.',
                    'errors' => [
                        'email' => ['Usuario no encontrado.']
                    ]
                ], 422);
            }

            // Update password using update() method to ensure it saves correctly
            $user->update([
                'contrasena' => Hash::make($request->password)
            ]);

            // Delete the used code
            DB::table('password_reset_codes')
                ->where('email', $request->email)
                ->where('user_type', $userType)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Contraseña restablecida con éxito.',
                'data' => [
                    'email' => $request->email
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error resetting password: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al restablecer la contraseña.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
