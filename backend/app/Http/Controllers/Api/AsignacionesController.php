<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asignaciones;
use App\Models\Equipos;
use App\Models\Fichas;
use Illuminate\Support\Facades\DB;

class AsignacionesController extends Controller
{
    /**
     * Assign equipment masively to users of a ficha.
     */
    public function asignarMasivamente(Request $request)
    {
        $request->validate([
            'id_ficha' => 'required|exists:fichas,id',
            'lote_importacion' => 'required|string'
        ]);

        $ficha = Fichas::findOrFail($request->id_ficha);
        $usuarios = $ficha->usuarios; // Collection of users linked to the ficha

        $equipos = Equipos::where('lote_importacion', $request->lote_importacion)
            ->where('estado', 'no_asignado')
            ->get();

        if ($equipos->count() < $usuarios->count()) {
            return response()->json([
                'success' => false,
                'message' => 'No hay suficientes equipos disponibles en el lote para todos los usuarios de la ficha.',
                'requeridos' => $usuarios->count(),
                'disponibles' => $equipos->count()
            ], 400);
        }

        try {
            $codigoLote = 'ASIG-' . $ficha->id . '-' . now()->format('YmdHis');
            $asignacionesRealizadas = 0;
            $detallesAsignacion = [];

            DB::transaction(function () use ($usuarios, $equipos, $ficha, $codigoLote, &$asignacionesRealizadas, &$detallesAsignacion) {
                // We use each() or similar to keep the collection pointer if needed, 
                // but since we are iterating users and popping equipment, a simple foreach works.
                $equiposColeccion = collect($equipos);

                foreach ($usuarios as $usuario) {
                    $equipo = $equiposColeccion->shift();

                    // Deactivate previous active assignments for this user
                    Asignaciones::where('doc', $usuario->doc)
                        ->where('estado', 'activo')
                        ->update(['estado' => 'inactivo']);

                    // Create new assignment
                    Asignaciones::create([
                        'doc' => $usuario->doc,
                        'serial_equipo' => $equipo->serial,
                        'numero_ambiente' => $ficha->numero_ambiente,
                        'estado' => 'activo',
                        'codigo_asignacion' => $codigoLote
                    ]);

                    // Update equipment status
                    $equipo->update(['estado' => 'asignado']);
                    
                    $detallesAsignacion[] = [
                        'documento' => $usuario->doc,
                        'nombre' => trim($usuario->primer_nombre . ' ' . $usuario->primer_apellido),
                        'serial_equipo' => $equipo->serial,
                        'placa_sena' => $equipo->placa_sena
                    ];

                    $asignacionesRealizadas++;
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Asignación masiva completada con éxito.',
                'codigo_lote' => $codigoLote,
                'total_asignaciones' => $asignacionesRealizadas,
                'detalles' => $detallesAsignacion
            ]);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error durante la asignación masiva: ' . $th->getMessage()
            ], 500);
        }
    }

    /**
     * Get assignment history grouped by batch code.
     */
    public function obtenerHistorial()
    {
        $asignaciones = Asignaciones::with(['usuario', 'equipo', 'ambiente'])
            ->whereNotNull('codigo_asignacion')
            ->where('estado', 'activo')
            ->orderBy('created_at', 'desc')
            ->get();

        $historial = $asignaciones->groupBy('codigo_asignacion')->map(function ($items, $codigo) {
            $primera = $items->first();
            return [
                'codigo_asignacion' => $codigo,
                'fecha' => $primera->created_at->toDateTimeString(),
                'ficha' => $primera->ambiente->numero_ficha ?? 'N/A',
                'total_equipos' => $items->count(),
                'detalles' => $items->map(function ($asig) {
                    return [
                        'documento' => $asig->doc,
                        'nombre' => $asig->usuario ? trim($asig->usuario->primer_nombre . ' ' . $asig->usuario->primer_apellido) : 'N/A',
                        'serial' => $asig->serial_equipo,
                        'placa' => $asig->equipo->placa_sena ?? 'N/A'
                    ];
                })
            ];
        })->values();

        return response()->json($historial);
    }
}
