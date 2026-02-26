<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Usuarios;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
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
