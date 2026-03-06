<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LicenciasSistema;
use App\Models\PagosLicencia;
use App\Models\Registros;
use App\Models\RegistrosEquipos;
use App\Models\Vehiculos;
use App\Models\Equipos;
use App\Models\Asignaciones;
use Illuminate\Http\Request;
use App\Models\Usuarios;
use App\Models\Entidades;
use App\Models\Registros;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
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
            // 1. Instituciones Activas (Licencias con estado 'activo')
            $activeCount = LicenciasSistema::where('estado', 'activo')->count();

            // 2. Licencias por vencer (en los próximos 30 días)
            $now = Carbon::now();
            $next30Days = Carbon::now()->addDays(30);
            $expiringCount = LicenciasSistema::whereBetween('fecha_vencimiento', [$now, $next30Days])
                ->where('estado', 'activo')
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

    /**
     * Get statistics for a specific entity (Normal Admin).
     * GET /api/normaladmin/stats
     */
    public function normalAdminStats(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user || !$user->nit_entidad) {
                return response()->json([
                    'success' => false,
                    'message' => 'Usuario no autenticado o no vinculado a una entidad'
                ], 401);
            }

            $nit = $user->nit_entidad;

            // 1. Vehículos registrados por la entidad
            $vehiculosCount = Vehiculos::whereHas('usuario', function ($query) use ($nit) {
                $query->where('nit_entidad', $nit);
            })->count();

            // 2. Equipos propios traídos (asignados a usuarios de la entidad)
            $equiposCount = Asignaciones::whereHas('usuario', function ($query) use ($nit) {
                $query->where('nit_entidad', $nit);
            })->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'vehiculos_ingresados' => $vehiculosCount,
                    'equipos_propios' => $equiposCount
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en DashboardController@normalAdminStats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas de la entidad',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for a Normal Admin dashboard (entity-specific).
     * GET /api/normal-admin/stats
     */
    public function normalAdminStats(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $nit = $user->nit_entidad;

            // 1. Usuarios Activos (Total users for the entity with status 'activo')
            $activeUsers = Usuarios::where('nit_entidad', $nit)
                ->where('estado', 'activo')
                ->count();

            // 2. Accesos Diarios (Registers today for this entity's users)
            $today = Carbon::today();
            $dailyAccesses = DB::table('registros')
                ->join('usuarios', 'registros.doc', '=', 'usuarios.doc')
                ->where('usuarios.nit_entidad', $nit)
                ->whereDate('registros.fecha', $today)
                ->count();

            // 3. Entity Information
            $entidad = Entidades::where('nit', $nit)->first();
            
            // 4. License Information
            $licencia = LicenciasSistema::where('nit_entidad', $nit)
                ->with('plan')
                ->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'active_users' => $activeUsers,
                    'daily_accesses' => $dailyAccesses,
                    'entity' => [
                        'nombre' => $entidad->nombre_entidad ?? 'No disponible',
                        'nit' => $entidad->nit ?? 'No disponible',
                        'direccion' => $entidad->direccion ?? 'No disponible',
                    ],
                    'license' => [
                        'estado' => $licencia->estado ?? 'Desconocido',
                        'fecha_vencimiento' => $licencia->fecha_vencimiento ?? 'No disponible',
                        'plan_nombre' => $licencia->plan->nombre_plan ?? 'No disponible',
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            Log::error('Error en DashboardController@normalAdminStats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener estadísticas del panel',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
