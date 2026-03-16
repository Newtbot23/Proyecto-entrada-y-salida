<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidades;
use App\Models\LicenciasSistema;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function downloadLicenses(Request $request)
    {
        try {
            $licenses = LicenciasSistema::with(['plan', 'entidad'])->get();

            if ($request->query('format') === 'json') {
                return response()->json(['data' => $licenses]);
            }

            $pdf = Pdf::loadView('reports.licenses', compact('licenses'));
            return $pdf->download('licencias.pdf');
        } catch (\Exception $e) {
            \Log::error('Error generating licenses PDF: ' . $e->getMessage());
            return response()->json(['error' => 'Error generando el reporte PDF.'], 500);
        }
    }

    public function downloadEntities(Request $request)
    {
        try {
            // Select specific fields as requested: Name, Representative, Email, etc.
            $entities = Entidades::select('nit', 'nombre_entidad', 'nombre_titular', 'correo', 'telefono', 'direccion')->get();

            if ($request->query('format') === 'json') {
                return response()->json(['data' => $entities]);
            }

            $pdf = Pdf::loadView('reports.entities_general', compact('entities'));
            return $pdf->download('entidades_general.pdf');
        } catch (\Exception $e) {
            \Log::error('Error generating entities PDF: ' . $e->getMessage());
            return response()->json(['error' => 'Error generando el reporte PDF.'], 500);
        }
    }

    public function downloadEntity(Request $request, $nit)
    {
        try {
            $entity = Entidades::with(['licencia', 'usuarios'])->find($nit);

            if (!$entity) {
                return response()->json(['message' => 'Entidad no encontrada'], 404);
            }

            if ($request->query('format') === 'json') {
                return response()->json(['data' => $entity]);
            }

            $pdf = Pdf::loadView('reports.entity_full', compact('entity'));
            return $pdf->download('entidad_' . $nit . '.pdf');
        } catch (\Exception $e) {
            \Log::error('Error generating entity PDF for NIT ' . $nit . ': ' . $e->getMessage());
            return response()->json(['error' => 'Error generando el reporte PDF.'], 500);
        }
    }

    public function getPersonReport(Request $request)
    {
        try {
            $query = $request->query('query'); // Can be doc or name
            $includeExtras = filter_var($request->query('include_extras', false), FILTER_VALIDATE_BOOLEAN);
            
            if (!$query) {
                return response()->json(['success' => false, 'message' => 'Parámetro de búsqueda requerido'], 400);
            }

            $nit = $request->user()->nit_entidad;

            // Search user
            $usuario = DB::table('usuarios')
                ->where('nit_entidad', $nit)
                ->where(function($q) use ($query) {
                    $q->where('doc', 'like', "%$query%")
                      ->orWhere(DB::raw("TRIM(CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido))"), 'like', "%$query%");
                })
                ->select(
                    'doc', 
                    DB::raw("TRIM(CONCAT_WS(' ', primer_nombre, segundo_nombre, primer_apellido, segundo_apellido)) as nombre"),
                    'correo',
                    'telefono'
                )
                ->first();

            if (!$usuario) {
                return response()->json(['success' => false, 'message' => 'Usuario no encontrado'], 404);
            }

            // Fetch records
            $registrosQuery = DB::table('registros')
                ->where('registros.doc', $usuario->doc)
                ->orderBy('registros.fecha', 'desc')
                ->orderBy('registros.hora_entrada', 'desc');

            if ($includeExtras) {
                $registros = $registrosQuery->get()->map(function($r) {
                    $r->equipos = DB::table('registros_equipos')
                        ->join('equipos', 'registros_equipos.serial_equipo', '=', 'equipos.serial')
                        ->join('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
                        ->where('registros_equipos.id_registro', $r->id)
                        ->select('equipos.serial', 'equipos.modelo', 'marcas_equipo.marca')
                        ->get();
                    return $r;
                });
            } else {
                $registros = $registrosQuery->get();
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'usuario' => $usuario,
                    'registros' => $registros
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Error getPersonReport: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al obtener el reporte', 'error' => $e->getMessage()], 500);
        }
    }

    public function getDailyReport(Request $request)
    {
        try {
            $date = $request->query('date', Carbon::today()->toDateString());
            $nit = $request->user()->nit_entidad;

            $registros = \App\Models\Registros::with(['equipos_registrados', 'usuario'])
                ->whereDate('fecha', $date)
                ->whereHas('usuario', function($q) use ($nit) {
                    $q->where('nit_entidad', $nit);
                })
                ->orderBy('hora_entrada', 'desc')
                ->get()
                ->map(function($r) {
                    return [
                        'id' => $r->id,
                        'doc' => $r->doc,
                        'usuario_nombre' => trim($r->usuario->primer_nombre . ' ' . $r->usuario->segundo_nombre . ' ' . $r->usuario->primer_apellido . ' ' . $r->usuario->segundo_apellido),
                        'fecha' => $r->fecha,
                        'hora_entrada' => $r->hora_entrada,
                        'hora_salida' => $r->hora_salida,
                        'placa' => $r->placa,
                        'seriales_equipos' => $r->equipos_registrados->pluck('serial_equipo')->join(', ') ?: '-'
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $registros,
                'date' => $date
            ]);

        } catch (\Exception $e) {
            \Log::error('Error getDailyReport: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al obtener el reporte diario', 'error' => $e->getMessage()], 500);
        }
    }

    public function downloadUserHistory(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
            }

            // Si viene una fecha 'YYYY-MM-DD', extraemos mes y año. 
            // Si no, usamos el mes y año actuales.
            $dateInput = $request->query('date');
            if ($dateInput) {
                $carbonDate = Carbon::parse($dateInput);
                $month = $carbonDate->month;
                $year = $carbonDate->year;
            } else {
                $month = $request->query('month', Carbon::now()->month);
                $year = $request->query('year', Carbon::now()->year);
            }

            $registros = DB::table('registros')
                ->leftJoin('vehiculos', 'registros.placa', '=', 'vehiculos.placa')
                ->where('registros.doc', $user->doc)
                ->whereMonth('registros.fecha', $month)
                ->whereYear('registros.fecha', $year)
                ->select(
                    'registros.id',
                    'registros.fecha',
                    'registros.hora_entrada',
                    'registros.hora_salida',
                    'registros.placa',
                    'vehiculos.marca as vehiculo_marca',
                    'vehiculos.modelo as vehiculo_modelo'
                )
                ->orderBy('registros.fecha', 'asc')
                ->orderBy('registros.hora_entrada', 'asc')
                ->get()
                ->map(function($r) {
                    $r->equipos = DB::table('registros_equipos')
                        ->join('equipos', 'registros_equipos.serial_equipo', '=', 'equipos.serial')
                        ->join('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
                        ->where('registros_equipos.id_registro', $r->id)
                        ->select('equipos.serial', 'equipos.modelo', 'marcas_equipo.marca')
                        ->get();
                    return $r;
                });

            $monthName = Carbon::createFromDate($year, $month, 1)->locale('es')->monthName;
            $data = [
                'user' => $user,
                'registros' => $registros,
                'month' => ucfirst($monthName),
                'year' => $year
            ];

            $pdf = Pdf::loadView('reports.user_history', $data);
            return $pdf->download("historial_{$monthName}_{$year}.pdf");

        } catch (\Exception $e) {
            \Log::error('Error downloadUserHistory: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error al generar el PDF', 'error' => $e->getMessage()], 500);
        }
    }
}
