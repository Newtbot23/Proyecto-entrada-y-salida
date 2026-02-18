<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Entidades;
use App\Models\LicenciasSistema;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function downloadLicenses(Request $request)
    {
        try {
            $licenses = LicenciasSistema::all();

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
            $entities = Entidades::select('nit', 'nombre_entidad', 'nombre_titular', 'correo', 'telefono')->get();

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
}
