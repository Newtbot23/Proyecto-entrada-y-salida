<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Entidades;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Schema;
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
            $entidades = Entidades::paginate($perPage);
            
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
            
            $validated = $request->validated();
            
            Log::info('Datos validados:', $validated);

            $entidad = Entidades::create($validated);

            Log::info('Entidad creada con ID: ' . $entidad->id);

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
    public function show(string $id)
    {
        try {
            $entidad = Entidades::find($id);

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
    public function update(Request $request, string $id)
    {
        try {
            $entidad = Entidades::find($id);

            if (!$entidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Entidad no encontrada'
                ], 404);
            }

            Log::info('Datos recibidos para actualizar entidad ID ' . $id . ':', $request->all());

            // Validación - el email y nit pueden ser únicos excepto para este registro
            $validated = $request->validated();

            Log::info('Datos validados para actualización:', $validated);

            // Actualizar solo los campos que se enviaron
            $entidad->update($validated);

            // Recargar el modelo para obtener los datos actualizados
            $entidad->refresh();

            Log::info('Entidad actualizada ID: ' . $entidad->id);

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
    public function destroy(string $id)
    {
        try {
            $entidad = Entidades::find($id);

            if (!$entidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Entidad no encontrada'
                ], 404);
            }

            // Guardar datos antes de eliminar para la respuesta
            $entidadData = $entidad->toArray();

            $entidad->delete();

            Log::info('Entidad eliminada ID: ' . $id);

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