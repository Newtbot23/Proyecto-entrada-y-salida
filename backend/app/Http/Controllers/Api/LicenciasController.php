<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LicenciasSistema;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\Api\Licencias\StoreLicenciaRequest;
use App\Http\Requests\Api\Licencias\UpdateReferenciaRequest;
use App\Http\Requests\Api\Licencias\UpdateEstadoRequest;

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
            $search = $request->query('search');
            $estado = $request->query('estado');
            $planId = $request->query('plan_id');

            // Construimos la consulta base cargando relaciones
            $query = LicenciasSistema::with(['entidad', 'plan']);

            // Filtro de búsqueda general (ID de licencia o Nombre de entidad)
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', '%' . $search . '%')
                        ->orWhereHas('entidad', function ($qEntidad) use ($search) {
                            $qEntidad->where('nombre_entidad', 'like', '%' . $search . '%');
                        });
                });
            }

            // Filtro por estado
            if (!empty($estado)) {
                $query->where('estado', $estado);
            }

            // Filtro por plan
            if (!empty($planId)) {
                $query->where('id_plan_lic', $planId);
            }

            // Ejecutamos la consulta con paginación
            $licencias = $query->paginate($perPage);

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
    public function store(StoreLicenciaRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();

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
            $licencia = LicenciasSistema::with(['entidad', 'plan'])->find($id);

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
    public function updateReferencia(UpdateReferenciaRequest $request, $id): JsonResponse
    {
        try {
            $validated = $request->validated();

            $licencia = LicenciasSistema::with(['entidad', 'plan'])->find($id);

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
    public function updateEstado(UpdateEstadoRequest $request, $id): JsonResponse
    {
        try {
            $validated = $request->validated();

            $licencia = LicenciasSistema::with(['entidad', 'plan'])->find($id);

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
    /**
     * Get the license associated with the authenticated user's entity.
     * GET /api/licencia-actual
     */
    public function getActualLicense(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user || !$user->nit_entidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado o no vinculado a una entidad'
                ], 401);
            }

            // Find the license associated with the entity's NIT
            $licencia = LicenciasSistema::with(['entidad', 'plan'])
                ->where('nit_entidad', $user->nit_entidad)
                ->first();

            if (!$licencia) {
                return response()->json([
                    'success' => false,
                    'message' => 'No se encontró una licencia para esta entidad'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $licencia
            ], 200);
        } catch (\Exception $e) {
            Log::error('Error en getActualLicense: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener la licencia actual',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
