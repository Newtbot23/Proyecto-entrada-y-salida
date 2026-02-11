<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LicenciasSistema;
use App\Models\PagosLicencia;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Get summary statistics for the dashboard.
     * GET /api/dashboard/stats
     */
    public function stats(): JsonResponse
    {
        try {
            // 1. Instituciones Activas (Licencias con estado 'activa')
            $activeCount = LicenciasSistema::where('estado', 'activa')->count();

            // 2. Licencias por vencer (en los próximos 30 días)
            $now = Carbon::now();
            $next30Days = Carbon::now()->addDays(30);
            $expiringCount = LicenciasSistema::whereBetween('fecha_vencimiento', [$now, $next30Days])
                ->where('estado', 'activa')
                ->count();

            // 3. Ingresos totales (Suma de precios de planes asociados a licencias pagadas)
            // Asumiendo que el revenue se basa en la tabla de pagos_licencia con estado 'pagado'
            // O sumando el precio_plan de las licencias registradas (si no hay pagos aún)
            // Según el esquema, pagos_licencia tiene relación con licencias_sistema
            // Vamos a sumar el precio_plan de todas las licencias que tienen al menos un pago en estado 'pagado'
            $totalRevenue = LicenciasSistema::join('planes_licencia', 'licencias_sistema.id_plan_lic', '=', 'planes_licencia.id')
                ->join('pagos_licencia', 'licencias_sistema.id', '=', 'pagos_licencia.id_licencia')
                ->where('pagos_licencia.estado', 'pagado')
                ->sum('planes_licencia.precio_plan');

            return response()->json([
                'success' => true,
                'data' => [
                    'active_institutions' => $activeCount,
                    'expiring_licenses' => $expiringCount,
                    'total_revenue' => $totalRevenue
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en DashboardController@stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas del dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
