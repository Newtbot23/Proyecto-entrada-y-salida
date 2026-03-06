<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Contracts\Encryption\DecryptException;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Http\Requests\Api\Usuarios\StoreUsuarioRequest;

class UsuariosController extends Controller
{
    /**
     * Store a newly created user in storage.
     * POST /api/usuarios-flow
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreUsuarioRequest $request): JsonResponse
    {
        // Validation is automatically handled by the StoreUsuarioRequest



        try {
            // Create the user as an Admin (id_rol = 1) for their entity
            $user = Usuarios::create([
                'doc' => $request->doc,
                'id_tip_doc' => $request->id_tip_doc,
                'primer_nombre' => $request->primer_nombre,
                'segundo_nombre' => $request->segundo_nombre ?? null, // Optional
                'primer_apellido' => $request->primer_apellido,
                'segundo_apellido' => $request->segundo_apellido ?? null, // Optional
                'telefono' => $request->telefono,
                'correo' => $request->correo,
                'contrasena' => Hash::make($request->contrasena), // Hash password
                'id_rol' => $request->id_rol ?? 1, // Dynamically set role, default to 1 (Admin)
                'nit_entidad' => $request->nit_entidad, // Properly link to entity
                'estado' => 'activo',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Admin user created successfully',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate QR code for entities
     */
    public function generateQr(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user || !$user->nit_entidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se pudo identificar la entidad del administrador.'
                ], 403);
            }

            $encryptedToken = Crypt::encryptString($user->nit_entidad);
            $registrationUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/register-user?token=' . urlencode($encryptedToken);

            // Using qrserver.com as a more reliable external API
            $qrApiUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($registrationUrl);
            
            // Using Laravel Http client which is more robust than file_get_contents
            // .withoutVerifying() is used to avoid common SSL issues on local Windows environments
            $response = Http::withoutVerifying()->get($qrApiUrl);
            
            if ($response->failed()) {
                 throw new \Exception("Could not fetch QR code from external service. Status: " . $response->status());
            }

            return response()->json([
                'success' => true,
                'qr_code' => base64_encode($response->body()),
                'content_type' => 'image/png'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error generando el código QR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register user with QR Token
     */
    public function registerWithQr(StoreUsuarioRequest $request): JsonResponse
    {
        try {
            $token = $request->input('qr_token');

            if (!$token) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de registro no proporcionado.'
                ], 400);
            }

            try {
                $nit_entidad = Crypt::decryptString(urldecode($token));
            } catch (DecryptException $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de registro inválido o manipulado.'
                ], 400);
            }

            $user = Usuarios::create([
                'doc' => $request->doc,
                'id_tip_doc' => $request->id_tip_doc,
                'primer_nombre' => $request->primer_nombre,
                'segundo_nombre' => $request->segundo_nombre ?? null,
                'primer_apellido' => $request->primer_apellido,
                'segundo_apellido' => $request->segundo_apellido ?? null,
                'telefono' => $request->telefono,
                'correo' => $request->correo,
                'contrasena' => Hash::make($request->contrasena),
                'id_rol' => 2, // Force Regular User role
                'nit_entidad' => $nit_entidad, // Assigned securely
                'estado' => 'activo',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'data' => $user
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error registrando usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Toggle the status of a user (activo/inactivo)
     * PATCH /api/usuarios/{doc}/estado
     */
    public function toggleEstado(string $doc): JsonResponse
    {
        try {
            $usuario = Usuarios::find($doc);

            if (!$usuario) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no encontrado'
                ], 404);
            }

            // Assuming estado is boolean or enum ('activo', 'inactivo').
            // Let's check based on current value.
            if ($usuario->estado === true || $usuario->estado === 1 || $usuario->estado === 'activo') {
                $usuario->estado = (is_bool($usuario->estado) || is_numeric($usuario->estado)) ? false : 'inactivo';
            } else {
                $usuario->estado = (is_bool($usuario->estado) || is_numeric($usuario->estado)) ? true : 'activo';
            }
            
            $usuario->save();

            return response()->json([
                'success' => true,
                'message' => 'Estado actualizado correctamente',
                'data' => [
                    'doc' => $usuario->doc,
                    'estado' => $usuario->estado
                ]
            ], 200);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error toggling estado: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
