<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PuertasController extends Controller
{
    /**
     * Search for a person by document and their associated equipment.
     */
    public function searchPersona(Request $request)
    {
        $doc = $request->query('doc');

        if (!$doc) {
            return response()->json(['success' => false, 'message' => 'Documento requerido'], 400);
        }

        $nit = $request->user()->nit_entidad;

        $usuario = DB::table('usuarios')
            ->select(
                'doc', 
                DB::raw("TRIM(CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido)) as nombre")
            )
            ->where('doc', $doc)
            ->where('nit_entidad', $nit)
            ->first();

        if (!$usuario) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }

        // Get 'propio' equipment for this user
        $equipos = DB::table('equipos')
            ->join('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
            ->where('equipos.doc', $doc)
            ->where('equipos.tipo_equipo', 'propio')
            ->select('equipos.*', 'marcas_equipo.marca')
            ->get();

        // Check if user is currently inside (has a record without hora_salida today)
        $registroAbierto = DB::table('registros')
            ->where('doc', $doc)
            ->whereDate('fecha', Carbon::today())
            ->whereNull('hora_salida')
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'usuario' => $usuario,
                'equipos' => $equipos,
                'estaAdentro' => !!$registroAbierto,
                'id_registro' => $registroAbierto ? $registroAbierto->id : null,
                'serial_equipo' => $registroAbierto ? $registroAbierto->serial_equipo : null
            ]
        ]);
    }

    /**
     * Search for a vehicle by doc or plate.
     */
    public function searchVehiculo(Request $request)
    {
        $query = $request->query('query'); // Can be doc or plate

        if (!$query) {
            return response()->json(['success' => false, 'message' => 'Documento o placa requerida'], 400);
        }

        $nit = $request->user()->nit_entidad;

        // Find all vehicles matching the query (either by plate or by owner's doc)
        // Restricted by the authenticated user's entity (nit_entidad)
        $vehiculos = DB::table('vehiculos')
            ->join('usuarios', 'vehiculos.doc', '=', 'usuarios.doc')
            ->join('tipos_vehiculo', 'vehiculos.id_tipo_vehiculo', '=', 'tipos_vehiculo.id')
            ->where(function($q) use ($query) {
                $q->where('vehiculos.placa', 'like', "%$query%")
                  ->orWhere('usuarios.doc', $query);
            })
            ->where('usuarios.nit_entidad', $nit)
            ->select(
                'vehiculos.*', 
                DB::raw("TRIM(CONCAT_WS(' ', usuarios.primer_nombre, usuarios.segundo_nombre, usuarios.primer_apellido, usuarios.segundo_apellido)) as usuario_nombre"), 
                'tipos_vehiculo.tipo_vehiculo'
            )
            ->get();

        if ($vehiculos->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Vehículo o usuario no encontrado'], 404);
        }

        // Get the doc of the first vehicle to find the user and their equipment
        $doc = $vehiculos->first()->doc;

        // Fetch 'propio' equipment for this user
        $equipos = DB::table('equipos')
            ->join('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
            ->where('equipos.doc', $doc)
            ->where('equipos.tipo_equipo', 'propio')
            ->select('equipos.*', 'marcas_equipo.marca')
            ->get();

        // Check if any of these vehicles are currently inside 
        // For simplicity, we just check if there's an open record for the user or specific vehicles
        // Let's get open records for this doc
        $registrosAbiertos = DB::table('registros')
            ->where('doc', $doc)
            ->whereDate('fecha', Carbon::today())
            ->whereNull('hora_salida')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'vehiculos' => $vehiculos,
                'equipos' => $equipos,
                'registrosAbiertos' => $registrosAbiertos
            ]
        ]);
    }

    /**
     * Register entry or exit.
     */
    public function registrarActividad(Request $request)
    {
        $request->validate([
            'doc' => 'required',
            'accion' => 'required|in:entrada,salida',
            'serial_equipo' => 'nullable|string',
            'placa' => 'nullable|string|max:10',
            'id_registro' => 'nullable|integer'
        ]);

        $now = Carbon::now();
        $nit = $request->user()->nit_entidad;

        // Security check: Ensure the user belongs to the same entity
        $usuarioEntidad = DB::table('usuarios')
            ->where('doc', $request->doc)
            ->where('nit_entidad', $nit)
            ->exists();

        if (!$usuarioEntidad) {
            return response()->json(['success' => false, 'message' => 'No autorizado para registrar este usuario'], 403);
        }

        if ($request->accion === 'entrada') {
            // Create new entry
            DB::table('registros')->insert([
                'doc' => $request->doc,
                'serial_equipo' => $request->serial_equipo ?? null,
                'placa' => $request->placa ?? null,
                'fecha' => $now->toDateString(),
                'hora_entrada' => $now->toTimeString(),
                'created_at' => $now,
                'updated_at' => $now
            ]);

            return response()->json(['success' => true, 'message' => 'Entrada registrada correctamente']);
        } else {
            // Update existing entry (exit)
            if (!$request->id_registro) {
                return response()->json(['success' => false, 'message' => 'ID de registro requerido para la salida'], 400);
            }

            DB::table('registros')
                ->where('id', $request->id_registro)
                ->update([
                    'hora_salida' => $now->toTimeString(),
                    'updated_at' => $now
                ]);

            return response()->json(['success' => true, 'message' => 'Salida registrada correctamente']);
        }
    }
}
