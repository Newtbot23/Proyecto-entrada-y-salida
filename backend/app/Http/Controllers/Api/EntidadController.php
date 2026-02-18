<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidades;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\Api\Entidad\StoreEntidadRequest;

class EntidadController extends Controller
{
    /**
     * Store a newly created entity in storage.
     * POST /api/entidades
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(StoreEntidadRequest $request): JsonResponse
    {
        // Validation is automatically handled by the StoreEntidadRequest

        if (false) { // Validator is now handled by FormRequest
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create the entity. 
            $entidad = Entidades::create([
                'nombre_entidad' => $request->nombre_entidad,
                'correo' => $request->correo,
                'direccion' => $request->direccion,
                'nombre_titular' => $request->nombre_titular,
                'telefono' => $request->telefono,
                'nit' => $request->nit,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Entity created successfully',
                'data' => [
                    'entidad' => $entidad,
                    'id' => $entidad->nit // Explicitly return NIT as ID for frontend compatibility
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating entity',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }
}
