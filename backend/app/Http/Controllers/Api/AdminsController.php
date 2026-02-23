<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Admins;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;
use App\Http\Requests\Api\Admins\StoreAdminRequest;
use App\Http\Requests\Api\Admins\UpdateAdminRequest;

/**
 * Controller for Admins Management CRUD
 */
class AdminsController extends Controller
{
    /**
     * Display a listing of admins.
     * GET /api/admins
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 10);
            $admins = Admins::paginate($perPage);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $admins->items(),
                    'total' => $admins->total(),
                    'current_page' => $admins->currentPage(),
                    'per_page' => $admins->perPage(),
                    'last_page' => $admins->lastPage(),
                ]
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error en AdminsController@index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener administradores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created admin in storage.
     * POST /api/admins
     */
    public function store(StoreAdminRequest $request)
    {
        try {
            $mensajes = [
                'required' => 'El :attribute es obligatorio.',
                'string' => 'El :attribute debe ser texto.',
                'max' => 'El :attribute no debe exceder los :max caracteres.',
                'min' => 'El :attribute debe tener al menos :min caracteres.',
                'email' => 'El formato de correo es inválido.',
                'unique' => 'El :attribute ya se encuentra registrado.',
                'regex' => 'El formato del :attribute es inválido.',
                'integer' => 'El :attribute debe ser un número entero.',
            ];

            $validated = $request->validate([
                'doc' => 'required|integer|unique:admins,doc',
                'nombre' => 'required|string|max:200',
                'telefono' => ['required', 'string', 'regex:/^(3[0-9]{9}|60[0-9]{8})$/'],
                'correo' => 'required|email|max:200|unique:admins,correo',
                'contrasena' => 'required|string|min:6',
            ], $mensajes);

            $validated['contrasena'] = Hash::make($validated['contrasena']);
            
            $admin = Admins::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Administrador creado exitosamente',
                'data' => $admin
            ], 201);
            
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en AdminsController@store: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el administrador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified admin.
     * GET /api/admins/{id}
     */
    public function show(string $doc)
    {
        try {
            $admin = Admins::find($doc);

            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Administrador no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $admin
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en AdminsController@show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el administrador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified admin in storage.
     * PUT/PATCH /api/admins/{id}
     */
    public function update(UpdateAdminRequest $request, string $doc)
    {
        try {
            $admin = Admins::find($doc);

            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Administrador no encontrado'
                ], 404);
            }

            $mensajes = [
                'required' => 'El :attribute es obligatorio.',
                'string' => 'El :attribute debe ser texto.',
                'max' => 'El :attribute no debe exceder los :max caracteres.',
                'min' => 'El :attribute debe tener al menos :min caracteres.',
                'email' => 'El formato de correo es inválido.',
                'unique' => 'El :attribute ya se encuentra registrado.',
                'regex' => 'El formato del :attribute es inválido.',
            ];

            $validated = $request->validate([
                'nombre' => 'sometimes|required|string|max:200',
                'telefono' => ['sometimes', 'required', 'string', 'regex:/^(3[0-9]{9}|60[0-9]{8})$/'],
                'correo' => [
                    'sometimes',
                    'required',
                    'email',
                    'max:200',
                    Rule::unique('admins', 'correo')->ignore($doc, 'doc')
                ],
                'contrasena' => 'sometimes|nullable|string|min:6',
            ], $mensajes);

            if (isset($validated['contrasena']) && !empty($validated['contrasena'])) {
                $validated['contrasena'] = Hash::make($validated['contrasena']);
            } else {
                unset($validated['contrasena']);
            }

            $admin->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Administrador actualizado exitosamente',
                'data' => $admin
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en AdminsController@update: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el administrador',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified admin from storage.
     * DELETE /api/admins/{id}
     */
    public function destroy(string $doc)
    {
        try {
            $admin = Admins::find($doc);

            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Administrador no encontrado'
                ], 404);
            }

            $admin->delete();

            return response()->json([
                'success' => true,
                'message' => 'Administrador eliminado exitosamente'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en AdminsController@destroy: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el administrador',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
