<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuarios;
use App\Models\Entidades;
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
    public function registerWithQr(Request $request): JsonResponse
    {
        // Manual validation since we can't use StoreUsuarioRequest (which requires nit_entidad)
        $validator = Validator::make($request->all(), [
            'doc' => 'required|string|unique:usuarios,doc|regex:/^[0-9]{7,10}$/',
            'id_tip_doc' => 'required|exists:tipo_doc,id_tip_doc',
            'primer_nombre' => 'required|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'segundo_nombre' => 'nullable|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'primer_apellido' => 'required|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'segundo_apellido' => 'nullable|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono' => 'required|string|max:13|regex:/^[0-9+\-\s()]+$/',
            'correo' => 'required|email|max:100|unique:usuarios,correo',
            'contrasena' => 'required|string|min:6',
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $token = $request->input('token');

            try {
                // Decrypt the NIT from the token
                $nit_entidad = Crypt::decryptString($token);
            } catch (DecryptException $e) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token de registro inválido o expirado.'
                ], 400);
            }

            // Validate that the entity exists
            $entidad = Entidades::where('nit', $nit_entidad)->first();
            if (!$entidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'La entidad asociada al token no existe.'
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
                'nit_entidad' => $nit_entidad, // Assigned securely from token
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
