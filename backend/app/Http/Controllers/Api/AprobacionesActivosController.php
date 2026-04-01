<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class AprobacionesActivosController extends Controller
{
    /**
     * Get all pending assets (vehicles and own equipment)
     */
    public function getPendientes(Request $request)
    {
        // Obtener vehículos pendientes
        $vehiculos = DB::table('vehiculos')
            ->join('usuarios', 'vehiculos.doc', '=', 'usuarios.doc')
            ->join('tipos_vehiculo', 'vehiculos.id_tipo_vehiculo', '=', 'tipos_vehiculo.id')
            ->leftJoin('marcas_vehiculo', 'vehiculos.id_marca', '=', 'marcas_vehiculo.id')
            ->where('vehiculos.estado_aprobacion', 'pendiente')
            ->select(
                'vehiculos.placa as id', // unificar identificador
                'vehiculos.placa',
                DB::raw("'vehiculo' as tipo_activo"),
                'tipos_vehiculo.tipo_vehiculo as descripcion_tipo',
                'marcas_vehiculo.nombre as marca',
                'usuarios.primer_nombre as usuario_nombres',
                'usuarios.primer_apellido as usuario_apellidos',
                'usuarios.doc as usuario_doc',
                'usuarios.imagen as foto_usuario',
                'vehiculos.img_vehiculo as imagen',
                'vehiculos.created_at'
            )->get();

        // Obtener equipos propios pendientes
        $equipos = DB::table('equipos')
            ->join('asignaciones', 'equipos.serial', '=', 'asignaciones.serial_equipo')
            ->join('usuarios', 'asignaciones.doc', '=', 'usuarios.doc')
            ->leftJoin('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
            ->where('equipos.estado_aprobacion', 'pendiente')
            ->where('equipos.tipo_equipo', 'propio')
            ->select(
                'equipos.serial as id', // unificar identificador
                'equipos.serial as placa',// mapear serial a placa para la tabla unificada
                DB::raw("'equipo' as tipo_activo"),
                DB::raw("'Equipo Propio' as descripcion_tipo"),
                'marcas_equipo.marca',
                'usuarios.primer_nombre as usuario_nombres',
                'usuarios.primer_apellido as usuario_apellidos',
                'usuarios.doc as usuario_doc',
                'usuarios.imagen as foto_usuario',
                'equipos.img_serial as imagen',
                'equipos.created_at'
            )->get();

        // Combinar y ordenar por fecha de creación (los más antiguos primero)
        $activos = $vehiculos->concat($equipos)->sortBy('created_at')->values();

        return response()->json([
            'success' => true,
            'data' => $activos
        ]);
    }

    /**
     * Update the approval status of an asset
     */
    public function updateEstado(Request $request, $tipo, $id)
    {
        $validator = Validator::make($request->all(), [
            'estado_aprobacion' => 'required|in:activo,inactivo'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $estado = $request->input('estado_aprobacion');

        try {
            if ($tipo === 'vehiculo') {
                $updated = DB::table('vehiculos')
                    ->where('placa', $id)
                    ->update(['estado_aprobacion' => $estado, 'updated_at' => Carbon::now()]);
                    
                if (!$updated) {
                    return response()->json(['success' => false, 'message' => 'Vehículo no encontrado.'], 404);
                }
            } elseif ($tipo === 'equipo') {
                $updated = DB::table('equipos')
                    ->where('serial', $id)
                    ->where('tipo_equipo', 'propio')
                    ->update(['estado_aprobacion' => $estado, 'updated_at' => Carbon::now()]);
                    
                if (!$updated) {
                    return response()->json(['success' => false, 'message' => 'Equipo no encontrado o no es propio.'], 404);
                }
            } else {
                return response()->json(['success' => false, 'message' => 'Tipo de activo inválido.'], 400);
            }

            return response()->json([
                'success' => true,
                'message' => 'Estado de aprobación actualizado correctamente.'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al actualizar el estado.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
