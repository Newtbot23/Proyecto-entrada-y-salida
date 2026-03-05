<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidades;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
 
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

        // Validation is automatically handled by the StoreEntidadRequest


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

        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->errorInfo[1] == 1062) {
                return response()->json([
                    'success' => false,
                    'message' => 'El NIT, correo o nombre de la entidad ya se encuentran en uso.',
                    'errors' => [
                        'duplicado' => ['Uno de los datos únicos introducidos ya está registrado en el sistema.']
                    ]
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'Error en la base de datos',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al crear la entidad',
                'errors' => ['server' => [$e->getMessage()]]
            ], 500);
        }
    }
}
