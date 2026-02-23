<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Entidades;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;
use App\Http\Requests\Api\Entidades\StoreEntidadRequest;
use App\Http\Requests\Api\Entidades\UpdateEntidadRequest;

class EntidadesController extends Controller
{
    /**
     * Display a listing of the resource.
     * GET /api/entidades
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->query('per_page', 10);
            $search = $request->query('search', '');
            
            $query = Entidades::with(['licencia', 'licencia.plan']);

            if (!empty($search)) {
                $query->where(function($q) use ($search) {
                    $q->where('nombre_entidad', 'LIKE', "%{$search}%")
                      ->orWhere('nit', 'LIKE', "%{$search}%")
                      ->orWhere('correo', 'LIKE', "%{$search}%");
                });
            }

            $entidades = $query->paginate($perPage);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $entidades->items(),
                    'total' => $entidades->total(),
                    'current_page' => $entidades->currentPage(),
                    'per_page' => $entidades->perPage(),
                    'last_page' => $entidades->lastPage(),
                ]
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error en index: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener entidades',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     * POST /api/entidades
     */
    public function store(StoreEntidadRequest $request)
    {
        try {
            Log::info('Datos recibidos en store:', $request->all());
            
            $mensajes = [
                'required' => 'El :attribute es obligatorio.',
                'string' => 'El :attribute debe ser texto.',
                'max' => 'El :attribute no debe exceder los :max caracteres.',
                'min' => 'El :attribute debe tener al menos :min caracteres.',
                'email' => 'El formato de correo es inválido.',
                'unique' => 'El :attribute ya se encuentra registrado.',
                'regex' => 'El formato del :attribute es inválido.',
                'in' => 'El valor seleccionado para :attribute es inválido.',
            ];

            $validated = $request->validate([
                'nombre_entidad' => 'required|string|max:255',
                'correo' => 'required|email|max:255|unique:entidades,correo',
                'direccion' => 'required|string|max:255',
                'nombre_titular' => 'required|string|max:255',
                'telefono' => ['required', 'string', 'regex:/^(3[0-9]{9}|60[0-9]{8})$/'],
                'nit' => ['required', 'string', 'regex:/^[0-9]{8,15}(-[0-9])?$/', 'unique:entidades,nit'],
                'estado' => 'sometimes|string|in:activo,inactivo',
            ], $mensajes);

            Log::info('Datos validados:', $validated);

            $entidad = Entidades::create($validated);

            Log::info('Entidad creada con NIT: ' . $entidad->nit);

            return response()->json([
                'success' => true,
                'message' => 'Entidad creada exitosamente',
                'data' => $entidad
            ], 201);
            
        } catch (ValidationException $e) {
            Log::error('Error de validación:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Error en store: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la entidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     * GET /api/entidades/{id}
     */
    public function show(string $nit)
    {
        try {
            $entidad = Entidades::with(['licencia', 'licencia.plan'])->find($nit);

            if (!$entidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Entidad no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $entidad
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en show: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la entidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified resource in storage.
     * PUT/PATCH /api/entidades/{id}
     */
    public function update(Request $request, string $nit)
    {
        try {
            $entidad = Entidades::find($nit);

            if (!$entidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Entidad no encontrada'
                ], 404);
            }

            Log::info('Datos recibidos para actualizar entidad NIT ' . $nit . ':', $request->all());

            // Validación - el email y nit pueden ser únicos excepto para este registro
            $mensajes = [
                'required' => 'El :attribute es obligatorio.',
                'string' => 'El :attribute debe ser texto.',
                'max' => 'El :attribute no debe exceder los :max caracteres.',
                'min' => 'El :attribute debe tener al menos :min caracteres.',
                'email' => 'El formato de correo es inválido.',
                'unique' => 'El :attribute ya se encuentra registrado.',
                'regex' => 'El formato del :attribute es inválido.',
                'in' => 'El valor seleccionado para :attribute es inválido.',
            ];

            $validated = $request->validate([
                'nombre_entidad' => 'sometimes|required|string|max:255',
                'correo' => [
                    'sometimes',
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('entidades', 'correo')->ignore($nit, 'nit')
                ],
                'direccion' => 'sometimes|required|string|max:255',
                'nombre_titular' => 'sometimes|required|string|max:255',
                'telefono' => ['sometimes', 'required', 'string', 'regex:/^(3[0-9]{9}|60[0-9]{8})$/'],
                'nit' => [
                    'sometimes',
                    'required',
                    'string',
                    'regex:/^[0-9]{8,15}(-[0-9])?$/',
                    Rule::unique('entidades', 'nit')->ignore($nit, 'nit')
                ],
                'estado' => 'sometimes|string|in:activo,inactivo',
            ], $mensajes);

            Log::info('Datos validados para actualización:', $validated);

            // Actualizar solo los campos que se enviaron
            $entidad->update($validated);

            // Recargar el modelo para obtener los datos actualizados
            $entidad->refresh();

            Log::info('Entidad actualizada NIT: ' . $entidad->nit);

            return response()->json([
                'success' => true,
                'message' => 'Entidad actualizada exitosamente',
                'data' => $entidad
            ], 200);

        } catch (ValidationException $e) {
            Log::error('Error de validación en update:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error en update: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la entidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     * DELETE /api/entidades/{id}
     */
    public function destroy(string $nit)
    {
        try {
            $entidad = Entidades::find($nit);

            if (!$entidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Entidad no encontrada'
                ], 404);
            }

            // Guardar datos antes de eliminar para la respuesta
            $entidadData = $entidad->toArray();

            $entidad->delete();

            Log::info('Entidad eliminada NIT: ' . $nit);

            return response()->json([
                'success' => true,
                'message' => 'Entidad eliminada exitosamente',
                'data' => $entidadData
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en destroy: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar la entidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}



[] 