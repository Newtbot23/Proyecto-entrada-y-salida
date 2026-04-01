<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Asignacion;
use App\Models\Equipo;
use App\Models\Ficha;
use App\Models\Lote;
use Illuminate\Support\Facades\DB;

class AsignacionController extends Controller
{
    /**
     * HTTP wrapper: assigns equipment from a lote to a ficha's users.
     * Delegates to the internal engine ejecutarAsignacion().
     */
    public function asignarMasivamente(Request $request)
    {
        $request->validate([
            'id_ficha' => 'required|exists:fichas,id',
            'id_lote'  => 'required|exists:lotes,id'
        ]);

        try {
            $ficha = Ficha::findOrFail($request->id_ficha);
            $lote  = Lote::findOrFail($request->id_lote);

            if ($ficha->usuarios->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'La ficha no tiene usuarios vinculados.'
                ], 400);
            }

            $resultado = static::ejecutarAsignacion($ficha, $lote);

            return response()->json([
                'success'            => true,
                'message'            => 'Proceso de asignación completado.',
                'total_asignaciones' => $resultado['total_asignaciones'],
                'detalles'           => $resultado['detalles']
            ]);

        } catch (\Throwable $th) {
            return response()->json([
                'success' => false,
                'message' => 'Ocurrió un error: ' . $th->getMessage()
            ], 500);
        }
    }

    /**
     * Core assignment engine — callable internally from other controllers.
     *
     * JORNADA-AWARE SHARING:
     *   A piece of equipment from a lote is AVAILABLE for a ficha if:
     *     (A) It has no EN_USO assignment at all, OR
     *     (B) Its only EN_USO assignments belong to fichas whose id_jornada
     *         is DIFFERENT from the current ficha’s jornada.
     *   This allows the same PC to serve both a morning and an afternoon class.
     *
     * INCREMENTAL LOGIC: users who already have an EN_USO assignment from
     *   this lote in the same jornada are skipped.
     *
     * PESSIMISTIC LOCKING: lockForUpdate() prevents double-assignment under concurrency.
     *
     * @param  Ficha  $ficha  Must have id_jornada set.
     * @param  Lote   $lote   The batch to draw equipment from.
     * @return array          ['total_asignaciones' => int, 'detalles' => array]
     */
    public static function ejecutarAsignacion(Ficha $ficha, Lote $lote): array
    {
        $usuarios               = $ficha->usuarios;
        $asignacionesRealizadas = 0;
        $detallesAsignacion     = [];

        DB::transaction(function () use ($usuarios, $ficha, $lote, &$asignacionesRealizadas, &$detallesAsignacion) {

            foreach ($usuarios as $usuario) {

                // REGLA 1: Saltar instructores
                if ($usuario->pivot->tipo_participante === 'instructor') {
                    continue;
                }

                // REGLA 2: LÓGICA INCREMENTAL (jornada-aware)
                // Saltar si el aprendiz ya tiene EN_USO de este lote en la MISMA jornada
                $yaTiene = Asignacion::where('doc', $usuario->doc)
                    ->where('id_lote', $lote->id)
                    ->where('estado', Asignacion::ESTADO_EN_USO)
                    ->whereHas('ficha', function ($q) use ($ficha) {
                        $q->where('id_jornada', $ficha->id_jornada);
                    })
                    ->exists();

                if ($yaTiene) {
                    continue;
                }

                // REGLA 3: DISPONIBILIDAD POR JORNADA + CANDADO PESIMISTA
                // Un equipo está disponible si NO tiene ninguna asignación EN_USO
                // cuya ficha tenga la MISMA jornada que la ficha actual.
                // (Un equipo con estado='asignado' en otra jornada sí puede reutilizarse)
                $equipo = Equipo::where('id_lote', $lote->id)
                    ->where('estado', '!=', 'inhabilitado')
                    ->whereDoesntHave('asignaciones', function ($q) use ($ficha) {
                        $q->where('estado', Asignacion::ESTADO_EN_USO)
                          ->whereHas('ficha', function ($q2) use ($ficha) {
                              $q2->where('id_jornada', $ficha->id_jornada);
                          });
                    })
                    ->lockForUpdate()
                    ->first();

                if (!$equipo) {
                    break; // Sin más equipos disponibles para esta jornada
                }

                // Crear la asignación
                Asignacion::create([
                    'doc'               => $usuario->doc,
                    'serial_equipo'     => $equipo->serial,
                    'id_ficha'          => $ficha->id,
                    'id_lote'           => $lote->id,
                    'estado'            => Asignacion::ESTADO_EN_USO,
                    'codigo_asignacion' => 'ASIG-' . $lote->codigo_lote . '-' . $ficha->numero_ficha
                ]);

                // Marcar el equipo como asignado.
                // Nota: aunque esté 'asignado', otra jornada podrá usarlo gracias
                // a la consulta whereDoesntHave de la Regla 3.
                $equipo->update(['estado' => 'asignado']);

                $detallesAsignacion[] = [
                    'documento'     => $usuario->doc,
                    'nombre'        => trim($usuario->primer_nombre . ' ' . $usuario->primer_apellido),
                    'serial_equipo' => $equipo->serial,
                    'placa_sena'    => $equipo->placa_sena
                ];

                $asignacionesRealizadas++;
            }
        });

        return [
            'total_asignaciones' => $asignacionesRealizadas,
            'detalles'           => $detallesAsignacion,
        ];
    }

    /**
     * Get assignment history grouped by batch or ficha.
     */
    public function obtenerHistorial()
    {
        // Using the new singular relationship and model
        $asignaciones = Asignacion::with(['usuario', 'equipo', 'ficha', 'lote'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Group by the generated code or lote ID
        $historial = $asignaciones->groupBy('codigo_asignacion')->map(function ($items, $codigo) {
            $primera = $items->first();
            return [
                'codigo_asignacion' => $codigo,
                'fecha' => $primera->created_at->toDateTimeString(),
                'ficha' => $primera->ficha->numero_ficha ?? 'N/A',
                'lote' => $primera->lote->codigo_lote ?? 'Manual',
                'total_equipos' => $items->count(),
                'detalles' => $items->map(function ($asig) {
                    return [
                        'documento' => $asig->doc,
                        'nombre' => $asig->usuario ? trim($asig->usuario->primer_nombre . ' ' . $asig->usuario->primer_apellido) : 'N/A',
                        'serial' => $asig->serial_equipo,
                        'placa' => $asig->equipo->placa_sena ?? 'N/A',
                        'estado' => $asig->estado
                    ];
                })
            ];
        })->values();

        return response()->json($historial);
    }
}
