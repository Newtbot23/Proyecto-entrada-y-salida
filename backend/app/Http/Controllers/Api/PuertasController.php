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
            ->join('asignaciones', 'equipos.serial', '=', 'asignaciones.serial_equipo')
            ->join('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
            ->where('asignaciones.doc', $doc)
            ->where('equipos.tipo_equipo', 'propio')
            ->where('equipos.estado_aprobacion', 'activo')
            ->select('equipos.*', 'marcas_equipo.marca', 'asignaciones.es_predeterminado')
            ->get();

        // Check if user is currently inside (has a record without hora_salida today)
        $registroAbierto = \App\Models\Registros::with(['equipos_registrados.equipo.marca'])
            ->where('doc', $doc)
            ->whereDate('fecha', Carbon::today())
            ->whereNull('hora_salida')
            ->first();

        $seriales_adentro = [];
        $equipos_adentro_data = [];
        if ($registroAbierto) {
            foreach ($registroAbierto->equipos_registrados as $er) {
                $seriales_adentro[] = $er->serial_equipo;
                $equipos_adentro_data[] = [
                    'serial' => $er->serial_equipo,
                    'marca' => $er->equipo->marca->marca ?? 'N/A',
                    'modelo' => $er->equipo->modelo ?? 'N/A',
                    'img_serial' => $er->equipo->img_serial ?? null,
                    'tipo_equipo' => $er->equipo->tipo_equipo ?? 'N/A'
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'usuario' => $usuario,
                'equipos' => $equipos,
                'estaAdentro' => !!$registroAbierto,
                'registro_activo' => $registroAbierto ? [
                    'id' => $registroAbierto->id,
                    'seriales_equipos' => $seriales_adentro,
                    'equipos_registrados' => $equipos_adentro_data
                ] : null,
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
            ->where('vehiculos.estado_aprobacion', 'activo')
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
            ->join('asignaciones', 'equipos.serial', '=', 'asignaciones.serial_equipo')
            ->join('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
            ->where('asignaciones.doc', $doc)
            ->where('equipos.tipo_equipo', 'propio')
            ->where('equipos.estado_aprobacion', 'activo')
            ->select('equipos.*', 'marcas_equipo.marca', 'asignaciones.es_predeterminado')
            ->get();

        // Check if any of these vehicles are currently inside 
        // For simplicity, we just check if there's an open record for the user or specific vehicles
        // Let's get open records for this doc
        $registrosAbiertos = \App\Models\Registros::with(['equipos_registrados.equipo.marca'])
            ->where('doc', $doc)
            ->whereDate('fecha', Carbon::today())
            ->whereNull('hora_salida')
            ->get();

        $registrosMap = $registrosAbiertos->map(function($r) {
            $r->seriales_equipos = $r->equipos_registrados->pluck('serial_equipo')->toArray();
            $r->equipos_adentro = $r->equipos_registrados->map(function($er) {
                return [
                    'serial' => $er->serial_equipo,
                    'marca' => $er->equipo->marca->marca ?? 'N/A',
                    'modelo' => $er->equipo->modelo ?? 'N/A',
                    'img_serial' => $er->equipo->img_serial ?? null,
                    'tipo_equipo' => $er->equipo->tipo_equipo ?? 'N/A'
                ];
            });
            unset($r->equipos_registrados);
            return $r;
        });

        return response()->json([
            'success' => true,
            'data' => [
                'vehiculos' => $vehiculos,
                'equipos' => $equipos,
                'registrosAbiertos' => $registrosMap,
                'registro_activo' => $registrosMap[0] ?? null
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
            'seriales_equipos' => 'nullable|array',
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
            try {
                DB::beginTransaction();

                // Create main registry entry
                $idRegistro = DB::table('registros')->insertGetId([
                    'doc' => $request->doc,
                    'placa' => $request->placa ?? null,
                    'fecha' => $now->toDateString(),
                    'hora_entrada' => $now->toTimeString(),
                    'created_at' => $now,
                    'updated_at' => $now
                ]);

                // Insert associated equipments
                if (!empty($request->seriales_equipos)) {
                    foreach ($request->seriales_equipos as $serial) {
                        DB::table('registros_equipos')->insert([
                            'id_registro' => $idRegistro,
                            'serial_equipo' => $serial,
                            'created_at' => $now,
                            'updated_at' => $now
                        ]);
                    }
                }

                DB::commit();
                return response()->json(['success' => true, 'message' => 'Entrada registrada correctamente']);
            } catch (\Exception $e) {
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Error al registrar entrada', 'error' => $e->getMessage()], 500);
            }
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
