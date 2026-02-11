<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LicenciasSistema;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LicenciasController extends Controller
{
    /**
     * Display a listing of all licenses with pagination.
     * GET /api/licencias
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 10);
            
            // Cargamos relaciones para mostrar el nombre de la institución y el plan
            $licencias = LicenciasSistema::with(['entidad', 'plan'])
                ->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $licencias->items(),
                    'total' => $licencias->total(),
                    'current_page' => $licencias->currentPage(),
                    'per_page' => $licencias->perPage(),
                    'last_page' => $licencias->lastPage(),
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en index de LicenciasController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener las licencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created license.
     * POST /api/licencias
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'fecha_inicio' => 'required|date',
                'fecha_vencimiento' => 'required|date|after:fecha_inicio',
                'estado' => 'required|string|in:activo,inactivo,expirado,pendiente',
                'id_plan_lic' => 'required|exists:planes_licencia,id',
                'id_entidad' => 'required|exists:entidades,id',
            ]);

            $licencia = LicenciasSistema::create([
                ...$validated,
                'fecha_ultima_validacion' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Licencia creada exitosamente',
                'data' => $licencia
            ], 201);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en store de LicenciasController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la licencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified license.
     * GET /api/licencias/{id}
     */
    public function show($id): JsonResponse
    {
        try {
            $licencia = LicenciasSistema::with(['entidad', 'plan'])->find($id);

            if (!$licencia) {
                return response()->json([
                    'success' => false,
                    'message' => 'Licencia no encontrada'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $licencia
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en show de LicenciasController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la licencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate a license manually.
     * PUT /api/licencias/{id}/activate
     */
    public function activate($id): JsonResponse
    {
        try {
            $licencia = LicenciasSistema::find($id);

            if (!$licencia) {
                return response()->json([
                    'success' => false,
                    'message' => 'Licencia no encontrada'
                ], 404);
            }

            $licencia->update([
                'estado' => 'activa',
                'fecha_ultima_validacion' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Licencia activada exitosamente',
                'data' => $licencia
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en activate de LicenciasController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al activar la licencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the payment reference for a license.
     * PATCH /api/licencias-sistema/{id}/referencia
     */
    public function updateReferencia(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'referencia_pago' => 'required|string|max:255',
            ]);

            $licencia = LicenciasSistema::find($id);

            if (!$licencia) {
                return response()->json([
                    'success' => false,
                    'message' => 'Licencia no encontrada'
                ], 404);
            }

            $licencia->update([
                'referencia_pago' => $validated['referencia_pago'],
                // We keep state as 'pendiente' until SuperAdmin approves
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Referencia de pago actualizada exitosamente. Espera la validación del administrador.',
                'data' => $licencia
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en updateReferencia de LicenciasController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar la referencia de pago',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the status of a license (e.g., from 'pendiente' to 'activo' or 'inactivo').
     * PATCH /api/licencias-sistema/{id}/estado
     */
    public function updateEstado(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'estado' => 'required|string|in:activo,activa,inactivo,suspendida,expirado,vencida,pendiente',
            ]);

            $licencia = LicenciasSistema::find($id);

            if (!$licencia) {
                return response()->json([
                    'success' => false,
                    'message' => 'Licencia no encontrada'
                ], 404);
            }

            // Normalize status if needed (optional, depending on DB enum)
            $newState = $validated['estado'];
            
            // Map legacy frontend states to backend enum if necessary
            $stateMap = [
                'activa' => 'activo',
                'suspendida' => 'inactivo',
                'vencida' => 'expirado'
            ];
            
            if (isset($stateMap[$newState])) {
                $newState = $stateMap[$newState];
            }

            $licencia->update([
                'estado' => $newState,
                'fecha_ultima_validacion' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Estado de licencia actualizado exitosamente',
                'data' => $licencia
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error en updateEstado de LicenciasController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado de la licencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
