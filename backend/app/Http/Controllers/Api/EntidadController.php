<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidades;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class EntidadController extends Controller
{
    /**
     * Store a newly created entity in storage.
     * POST /api/entidades
     * 
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        // Validation of required fields for an entity
        $validator = Validator::make($request->all(), [
            'nombre_entidad' => 'required|string|max:200',
            'correo' => 'required|email|max:200',
            'direccion' => 'required|string|max:200',
            'nombre_titular' => 'required|string|max:100',
            'telefono' => 'required|string|max:15',
            'nit' => 'required|string|max:15|unique:entidades,nit',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Create the entity. Note: 'estado' is removed as it's not in the DB table.
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
                    'id' => $entidad->id
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
