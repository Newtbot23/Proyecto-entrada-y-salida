<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Vehiculos;
use App\Models\Equipos;

class UserDashboardController extends Controller
{
    public function getCatalogs()
    {
        $tiposVehiculo = DB::table('tipos_vehiculo')->select('id', 'tipo_vehiculo')->get();
        $marcasEquipo = DB::table('marcas_equipo')->select('id', 'marca')->get();
        $sistemasOperativos = DB::table('sistemas_operativos')->select('id', 'sistema_operativo')->get();

        return response()->json([
            'success' => true,
            'data' => [
                'tipos_vehiculo' => $tiposVehiculo,
                'marcas_equipo' => $marcasEquipo,
                'sistemas_operativos' => $sistemasOperativos
            ]
        ]);
    }

    public function getVehiculos(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $vehiculos = DB::table('vehiculos')
            ->join('tipos_vehiculo', 'vehiculos.id_tipo_vehiculo', '=', 'tipos_vehiculo.id')
            ->where('vehiculos.doc', $user->doc)
            ->select('vehiculos.*', 'tipos_vehiculo.tipo_vehiculo')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $vehiculos
        ]);
    }

    public function getEquipos(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $equipos = DB::table('equipos')
            ->join('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
            ->join('sistemas_operativos', 'equipos.id_sistema_operativo', '=', 'sistemas_operativos.id')
            ->where('equipos.doc', $user->doc)
            ->select('equipos.*', 'marcas_equipo.marca', 'sistemas_operativos.sistema_operativo as so')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $equipos
        ]);
    }

    public function storeVehiculo(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $request->validate([
            'placa' => 'required|string|max:10|unique:vehiculos,placa',
            'id_tipo_vehiculo' => 'required|integer',
            'marca' => 'required|string|max:100',
            'modelo' => 'required|string|max:100',
            'color' => 'required|string|max:50',
            'descripcion' => 'nullable|string'
        ]);

        try {
            DB::table('vehiculos')->insert([
                'placa' => $request->placa,
                'id_tipo_vehiculo' => $request->id_tipo_vehiculo,
                'doc' => $user->doc,
                'marca' => $request->marca,
                'modelo' => $request->modelo,
                'color' => $request->color,
                'descripcion' => $request->descripcion ?? '',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vehículo registrado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar vehículo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function storeEquipo(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
        }

        $request->validate([
            'serial' => 'required|string|max:100|unique:equipos,serial',
            'id_marca' => 'required|integer',
            'modelo' => 'required|string|max:100',
            'tipo_equipo_desc' => 'required|string|max:200',
            'caracteristicas' => 'nullable|string',
            'id_sistema_operativo' => 'required|integer'
        ]);

        try {
            DB::table('equipos')->insert([
                'serial' => $request->serial,
                'tipo_equipo' => 'propio',
                'placa_sena' => 'N/A', // Placa sena defaults to N/A for propio
                'id_marca' => $request->id_marca,
                'estado' => 'no_asignado',
                'modelo' => $request->modelo,
                'tipo_equipo_desc' => $request->tipo_equipo_desc,
                'caracteristicas' => $request->caracteristicas ?? '',
                'id_sistema_operativo' => $request->id_sistema_operativo,
                'doc' => $user->doc,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Equipo registrado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al registrar equipo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
