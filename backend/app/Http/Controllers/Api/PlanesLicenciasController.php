<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LicenciasSistema;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\Api\PlanesLicencias\StorePlanesLicenciasRequest;
use Carbon\Carbon;

class PlanesLicenciasController extends Controller
{
    /**
     * Store a newly created license in storage.
     * POST /api/licencias-sistema
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StorePlanesLicenciasRequest $request): JsonResponse
    {
        // Validation is automatically handled by the StorePlanesLicenciasRequest



        try {
            // Set default dates for the license (e.g., 1 year duration)
            $fechaInicio = Carbon::now();
            $fechaVencimiento = Carbon::now()->addYear();

            $licencia = LicenciasSistema::create([
                'fecha_inicio' => $fechaInicio,
                'fecha_vencimiento' => $fechaVencimiento,
                'estado' => 'activa', // Default status for new registration
                'fecha_ultima_validacion' => $fechaInicio,
                'id_plan_lic' => $request->id_plan_lic,
                'id_entidad' => $request->id_entidad,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'License created successfully',
                'data' => $licencia
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating license',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
