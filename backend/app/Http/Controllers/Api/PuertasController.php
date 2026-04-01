<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Usuarios;
use App\Models\Equipo;
use App\Models\Asignacion;
use App\Models\Vehiculos;
use App\Models\Registros;
use App\Models\RegistrosEquipos;
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

        $usuario = Usuarios::select('doc', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido')
            ->where('doc', $doc)
            ->where('nit_entidad', $nit)
            ->first();

        if ($usuario) {
            $usuario->nombre = trim($usuario->primer_nombre . ' ' . $usuario->segundo_nombre . ' ' . $usuario->primer_apellido . ' ' . $usuario->segundo_apellido);
        }

        if (!$usuario) {
            return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
        }

        // Get 'propio' equipment for this user
        $equipos = Asignacion::where('doc', $doc)
            ->whereHas('equipo', function($q) {
                $q->where('tipo_equipo', 'propio')
                  ->where('estado_aprobacion', 'activo');
            })
            ->with(['equipo.marca'])
            ->get()
            ->map(function($asignacion) {
                $equipo = $asignacion->equipo;
                return (object) array_merge((array)$equipo->toArray(), [
                    'marca' => $equipo->marca->marca ?? 'N/A',
                    'es_predeterminado' => $asignacion->es_predeterminado
                ]);
            });

        // Check if user is currently inside (has a record without hora_salida, regardless of the date)
        $registroAbierto = \App\Models\Registros::with(['equipos_registrados.equipo.marca'])
            ->where('doc', $doc)
            ->whereNull('hora_salida')
            ->orderBy('id', 'desc')
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
        $vehiculos = Vehiculos::with(['usuario', 'tipo_vehiculo'])
            ->where('estado_aprobacion', 'activo')
            ->where(function($q) use ($query) {
                $q->where('placa', 'like', "%$query%")
                  ->orWhere('doc', $query);
            })
            ->whereHas('usuario', function($q) use ($nit) {
                $q->where('nit_entidad', $nit);
            })
            ->get()
            ->map(function($v) {
                $v->usuario_nombre = trim($v->usuario->primer_nombre . ' ' . $v->usuario->segundo_nombre . ' ' . $v->usuario->primer_apellido . ' ' . $v->usuario->segundo_apellido);
                $v->tipo_vehiculo = $v->tipo_vehiculo->tipo_vehiculo ?? null;
                return $v;
            });

        if ($vehiculos->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Vehículo o usuario no encontrado'], 404);
        }

        // Get the doc of the first vehicle to find the user and their equipment
        $doc = $vehiculos->first()->doc;

        // Fetch 'propio' equipment for this user
        $equipos = Asignacion::where('doc', $doc)
            ->whereHas('equipo', function($q) {
                $q->where('tipo_equipo', 'propio')
                  ->where('estado_aprobacion', 'activo');
            })
            ->with(['equipo.marca'])
            ->get()
            ->map(function($asignacion) {
                $equipo = $asignacion->equipo;
                return (object) array_merge((array)$equipo->toArray(), [
                    'marca' => $equipo->marca->marca ?? 'N/A',
                    'es_predeterminado' => $asignacion->es_predeterminado
                ]);
            });

        // Check if any of these vehicles are currently inside 
        // We look for open records for this user regardless of the date, ordered by newest first
        $registrosAbiertos = \App\Models\Registros::with(['equipos_registrados.equipo.marca'])
            ->where('doc', $doc)
            ->whereNull('hora_salida')
            ->orderBy('id', 'desc')
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
        $usuarioEntidad = Usuarios::where('doc', $request->doc)
            ->where('nit_entidad', $nit)
            ->exists();

        if (!$usuarioEntidad) {
            return response()->json(['success' => false, 'message' => 'No autorizado para registrar este usuario'], 403);
        }

        if ($request->accion === 'entrada') {
            try {
                DB::beginTransaction();

                // Create main registry entry
                $registro = Registros::create([
                    'doc' => $request->doc,
                    'placa' => $request->placa ?? null,
                    'fecha' => $now->toDateString(),
                    'hora_entrada' => $now->toTimeString(),
                ]);
                
                $idRegistro = $registro->id;

                // Insert associated equipments
                if (!empty($request->seriales_equipos)) {
                    foreach ($request->seriales_equipos as $serial) {
                        RegistrosEquipos::create([
                            'id_registro' => $idRegistro,
                            'serial_equipo' => $serial,
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

            Registros::where('id', $request->id_registro)
                ->update([
                    'hora_salida' => $now->toTimeString(),
                ]);

            return response()->json(['success' => true, 'message' => 'Salida registrada correctamente']);
        }
    }
}
