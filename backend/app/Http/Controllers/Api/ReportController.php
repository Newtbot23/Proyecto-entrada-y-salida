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
                $registrosQuery->leftJoin('vehiculos', 'registros.placa', '=', 'vehiculos.placa')
                               ->leftJoin('tipos_vehiculo', 'vehiculos.id_tipo_vehiculo', '=', 'tipos_vehiculo.id')
                               ->leftJoin('equipos', 'registros.serial_equipo', '=', 'equipos.serial')
                               ->leftJoin('marcas_equipo', 'equipos.id_marca', '=', 'marcas_equipo.id')
                               ->select(
                                   'registros.*',
                                   'vehiculos.placa as vehiculo_placa',
                                   'tipos_vehiculo.tipo_vehiculo',
                                   'equipos.serial as equipo_serial',
                                   'equipos.tipo_equipo',
                                   'marcas_equipo.marca as equipo_marca'
                               );
            } else {
                $registrosQuery->select('registros.id', 'registros.doc', 'registros.fecha', 'registros.hora_entrada', 'registros.hora_salida');
            }

            $registros = $registrosQuery->get();

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

            $registros = DB::table('registros')
                ->join('usuarios', 'registros.doc', '=', 'usuarios.doc')
                ->where('usuarios.nit_entidad', $nit)
                ->whereDate('registros.fecha', $date)
                ->select(
                    'registros.*',
                    DB::raw("TRIM(CONCAT_WS(' ', usuarios.primer_nombre, usuarios.segundo_nombre, usuarios.primer_apellido, usuarios.segundo_apellido)) as usuario_nombre")
                )
                ->orderBy('registros.hora_entrada', 'desc')
                ->get();

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
}
