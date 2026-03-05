<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlanesLicencia;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\Api\Planes\StorePlanRequest;
use App\Http\Requests\Api\Planes\UpdatePlanRequest;

class PlanesController extends Controller
{
    /**
     * Display a listing of the plans with pagination.
     * GET /api/planes
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = $request->query('per_page', 10);
            $planes = PlanesLicencia::paginate($perPage);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $planes->items(),
                    'total' => $planes->total(),
                    'current_page' => $planes->currentPage(),
                    'per_page' => $planes->perPage(),
                    'last_page' => $planes->lastPage(),
                ]
            ], 200);
            
        } catch (\Exception $e) {
            Log::error('Error en index de PlanesController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener los planes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created plan in the database.
     * POST /api/planes
     */
    public function store(StorePlanRequest $request): JsonResponse
    {
        try {
            Log::info('Datos recibidos en store de PlanesController:', $request->all());

            $validated = $request->validated();

            Log::info('Datos validados para nuevo plan:', $validated);

            $plan = PlanesLicencia::create($validated);

            Log::info('Plan creado con ID: ' . $plan->id);

            return response()->json([
                'success' => true,
                'message' => 'Plan creado exitosamente',
                'data' => $plan
            ], 201);

        } catch (ValidationException $e) {
            Log::error('Error de validación en store de PlanesController:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Exception $e) {
            Log::error('Error en store de PlanesController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al crear el plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified plan.
     * GET /api/planes/{id}
     */
    public function show($id): JsonResponse
    {
        try {
            $plan = PlanesLicencia::find($id);

            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan no encontrado'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $plan
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en show de PlanesController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener el plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified plan in the database.
     * PUT /api/planes/{id}
     */
    public function update(UpdatePlanRequest $request, $id): JsonResponse
    {
        try {
            $plan = PlanesLicencia::find($id);

            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan no encontrado'
                ], 404);
            }

            Log::info('Datos recibidos para actualizar plan ID ' . $id . ':', $request->all());

            $validated = $request->validated();

            Log::info('Datos validados para actualización de plan:', $validated);

            $plan->update($validated);
            $plan->refresh();

            Log::info('Plan actualizado ID: ' . $plan->id);

            return response()->json([
                'success' => true,
                'message' => 'Plan actualizado exitosamente',
                'data' => $plan
            ], 200);

        } catch (ValidationException $e) {
            Log::error('Error de validación en update de PlanesController:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            Log::error('Error en update de PlanesController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified plan from the database.
     * DELETE /api/planes/{id}
     */
    public function destroy($id): JsonResponse
    {
        try {
            $plan = PlanesLicencia::find($id);

            if (!$plan) {
                return response()->json([
                    'success' => false,
                    'message' => 'Plan no encontrado'
                ], 404);
            }

            $planData = $plan->toArray();
            $plan->delete();

            Log::info('Plan eliminado ID: ' . $id);

            return response()->json([
                'success' => true,
                'message' => 'Plan eliminado exitosamente',
                'data' => $planData
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en destroy de PlanesController: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el plan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
