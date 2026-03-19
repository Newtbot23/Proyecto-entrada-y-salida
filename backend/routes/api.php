<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserDashboardController;
use App\Http\Controllers\Api\DynamicTableController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TipoDocController;
use App\Http\Controllers\Api\FichaController;
use App\Models\DetalleFichaUsuarios;

Route::get('/login', function () {
    return response()->json(['success' => false, 'message' => 'No autenticado'], 401);
})->name('login');

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/admins/login', [App\Http\Controllers\Api\AdminsAuthController::class, 'login']);
Route::post('/normaladmin/login', [App\Http\Controllers\Api\NormalAdminAuthController::class, 'login']);

// Password Recovery
Route::post('/forgot-password', [App\Http\Controllers\Api\PasswordRecoveryApiController::class, 'sendResetCode']);
Route::post('/verify-code', [App\Http\Controllers\Api\PasswordRecoveryApiController::class, 'verifyCode']);
Route::post('/reset-password', [App\Http\Controllers\Api\PasswordRecoveryApiController::class, 'resetPassword']);

// Public Pricing & Common Data
Route::get('/plans', [App\Http\Controllers\Api\PricingController::class, 'index']);
Route::post('/plans/select', [App\Http\Controllers\Api\PricingController::class, 'select']);
Route::get('/tipo-doc', [TipoDocController::class, 'index']);

// Registration Flow
Route::post('/registration/entidades', [App\Http\Controllers\Api\EntidadController::class, 'store']);
Route::post('/registration/licencias', [App\Http\Controllers\Api\PlanesLicenciasController::class, 'store']);
Route::post('/registration/usuarios', [App\Http\Controllers\Api\UsuariosController::class, 'store']);
Route::post('/registration/complete-entity', [App\Http\Controllers\Api\RegistrationFlowController::class, 'finishRegistration']);
Route::post('/registration/full', [App\Http\Controllers\Api\RegistrationFlowController::class, 'register']);

// QR External Registration (Public)
Route::post('/usuarios/qr-register', [App\Http\Controllers\Api\UsuariosController::class, 'registerWithQr']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // User Context
    Route::get('/user', function (Request $request) {
        $user = $request->user();
        $isInstructor = DetalleFichaUsuarios::where('doc', $user->doc)
            ->where('tipo_participante', 'instructor')
            ->exists();
        $user->es_instructor = $isInstructor;
        return $user;
    });

    // Admins Management
    Route::apiResource('admins', App\Http\Controllers\Api\AdminsController::class);

    // Planes Management
    Route::get('/planes', [App\Http\Controllers\Api\PlanController::class, 'index']);
    Route::post('/planes', [App\Http\Controllers\Api\PlanController::class, 'store']);
    Route::get('/planes/{id}', [App\Http\Controllers\Api\PlanController::class, 'show']);
    Route::put('/planes/{id}', [App\Http\Controllers\Api\PlanController::class, 'update']);
    Route::delete('/planes/{id}', [App\Http\Controllers\Api\PlanController::class, 'destroy']);

    // Entidades Management
    Route::get('/entidades', [App\Http\Controllers\Api\EntidadController::class, 'index']);
    Route::post('/entidades', [App\Http\Controllers\Api\EntidadController::class, 'store']);
    Route::get('/entidades/{id}', [App\Http\Controllers\Api\EntidadController::class, 'show']);
    Route::put('/entidades/{id}', [App\Http\Controllers\Api\EntidadController::class, 'update']);
    Route::delete('/entidades/{id}', [App\Http\Controllers\Api\EntidadController::class, 'destroy']);
    Route::get('/entidades/{nit}/admins', [App\Http\Controllers\Api\EntidadController::class, 'getAdmins']);

    // User Management
    Route::patch('/usuarios/{doc}/estado', [App\Http\Controllers\Api\UsuariosController::class, 'toggleEstado']);
    Route::get('/usuarios/qr-registro', [App\Http\Controllers\Api\UsuariosController::class, 'generateQr']);

    // Asset Approvals
    Route::get('/admin/activos-pendientes', [App\Http\Controllers\Api\AprobacionesActivosController::class, 'getPendientes']);
    Route::patch('/admin/activos/{tipo}/{id}/estado', [App\Http\Controllers\Api\AprobacionesActivosController::class, 'updateEstado']);

    // Dashboard & Stats
    Route::get('/dashboard/stats', [App\Http\Controllers\Api\DashboardController::class, 'stats']);
    Route::get('/normal-admin/stats', [App\Http\Controllers\Api\DashboardController::class, 'normalAdminStats']);

    // Licenses Management
    Route::get('/licencias', [App\Http\Controllers\Api\LicenciasController::class, 'index']);
    Route::post('/licencias', [App\Http\Controllers\Api\LicenciasController::class, 'store']);
    Route::get('/licencias/{id}', [App\Http\Controllers\Api\LicenciasController::class, 'show']);
    Route::put('/licencias/{id}/activate', [App\Http\Controllers\Api\LicenciasController::class, 'activate']);
    Route::patch('/licencias-sistema/{id}/estado', [App\Http\Controllers\Api\LicenciasController::class, 'updateEstado']);
    Route::get('/licencia-actual', [App\Http\Controllers\Api\LicenciasController::class, 'getActualLicense']);

    // Stripe Payment
    Route::post('/stripe/checkout-session', [App\Http\Controllers\Api\StripeCheckoutController::class, 'createCheckoutSession']);
    Route::post('/stripe/payment-success', [App\Http\Controllers\Api\StripeCheckoutController::class, 'confirmPayment']);

    // User Dashboard Routes
    Route::get('/user/catalogs', [UserDashboardController::class, 'getCatalogs']);
    Route::get('/user/vehiculos', [UserDashboardController::class, 'getVehiculos']);
    Route::get('/user/equipos', [UserDashboardController::class, 'getEquipos']);
    Route::get('/user/entradas', [UserDashboardController::class, 'getEntradas']);
    Route::get('/user/check-active-session', [UserDashboardController::class, 'checkActiveSession']);
    Route::post('/user/vehiculos', [UserDashboardController::class, 'storeVehiculo']);
    Route::post('/user/equipos', [UserDashboardController::class, 'storeEquipo']);
    Route::patch('/user/activos/{tipo}/{id}/toggle-estado', [UserDashboardController::class, 'toggleEstado']);
    Route::patch('/user/activos/{tipo}/{id}/set-default', [UserDashboardController::class, 'setDefaultAsset']);
    Route::post('/ocr/read-plate', [UserDashboardController::class, 'readPlate']);
    Route::post('/ocr/read-serial', [UserDashboardController::class, 'readSerial']);
    Route::get('/user/barcode-base64', [App\Http\Controllers\Api\UsuariosController::class, 'getBarcodeBase64']);

    // Dynamic Tables
    Route::get('/tablas-cortas', [DynamicTableController::class, 'getShortTables']);
    Route::get('/esquema/{table}', [DynamicTableController::class, 'getTableSchema']);
    Route::get('/datos/{table}', [DynamicTableController::class, 'index']);
    Route::post('/datos/{table}', [DynamicTableController::class, 'store']);
    Route::put('/datos/{table}/{id}', [DynamicTableController::class, 'update']);

    // Reports
    Route::get('/reports/licenses', [ReportController::class, 'downloadLicenses']);
    Route::get('/reports/entities', [ReportController::class, 'downloadEntities']);
    Route::get('/reports/entities/{nit}', [ReportController::class, 'downloadEntity']);
    Route::get('/reports/person', [ReportController::class, 'getPersonReport']);
    Route::get('/reports/daily', [ReportController::class, 'getDailyReport']);
    Route::get('/user/history/export-pdf', [ReportController::class, 'downloadUserHistory']);

    // Fichas Management
    Route::get('/fichas/catalogs', [FichaController::class, 'getCatalogs']);
    Route::get('/fichas/sin-usuarios', [FichaController::class, 'getFichasSinUsuarios']);
    Route::get('/usuarios/asignables', [FichaController::class, 'getUsuariosAsignables']);
    Route::get('/fichas/buscar/{numero}', [FichaController::class, 'buscarPorNumero']);
    Route::get('/fichas/{id}/usuarios-detallados', [FichaController::class, 'getUsuariosDeFicha']);
    Route::get('/fichas', [FichaController::class, 'index']);
    Route::post('/fichas', [FichaController::class, 'store']);
    Route::get('/fichas/{id}/usuarios', [FichaController::class, 'getUsuarios']);
    Route::post('/fichas/{id}/asignar', [FichaController::class, 'asignarUsuarios']);
    Route::patch('/fichas/detalle/{detalle_id}', [FichaController::class, 'actualizarRolParticipante']);
    Route::patch('/fichas/{id}/usuarios/{doc}/rol', [FichaController::class, 'actualizarRolPorFichaYUsuario']);
    Route::delete('/fichas/{id}/usuarios/{doc}', [FichaController::class, 'desvincularUsuario']);
    Route::patch('/fichas/{id}/hora-limite', [FichaController::class, 'updateHoraLimite']);
    Route::get('/instructor/asistencia-base', [FichaController::class, 'getInstructorAsistenciaBase']);
    Route::patch('/fichas/{id}/estado', [FichaController::class, 'cambiarEstado']);
    Route::get('/instructor/fichas/{fichaId}/asistencia-mensual', [FichaController::class, 'getAsistenciaMensual']);
    Route::get('/instructor/asistencia-mensual', [FichaController::class, 'getInstructorAsistenciaMensual']);

    // Puertas Access Control
    Route::get('/puertas/search-persona', [App\Http\Controllers\Api\PuertasController::class, 'searchPersona']);
    Route::get('/puertas/search-vehiculo', [App\Http\Controllers\Api\PuertasController::class, 'searchVehiculo']);
    Route::post('/puertas/registrar-actividad', [App\Http\Controllers\Api\PuertasController::class, 'registrarActividad']);

    // Equipos Management
    Route::get('/equipos/catalogs', [App\Http\Controllers\Api\EquipoController::class, 'getCatalogs']);
    Route::post('/equipos', [App\Http\Controllers\Api\EquipoController::class, 'store']);
    Route::post('/equipos/importar', [App\Http\Controllers\Api\EquipoController::class, 'importarCsv']);
    Route::get('/equipos/lotes', [App\Http\Controllers\Api\EquipoController::class, 'getLotes']);
    Route::put('/equipos/lotes/renombrar', [App\Http\Controllers\Api\EquipoController::class, 'renombrarLote']);
    Route::put('/equipos/{id}/mover-lote', [App\Http\Controllers\Api\EquipoController::class, 'moverEquipoLote']);
    Route::get('/equipos/por-lote', [App\Http\Controllers\Api\EquipoController::class, 'getEquiposByLote']);
    // Asignaciones Management
    Route::post('/asignaciones/masivas', [App\Http\Controllers\Api\AsignacionesController::class, 'asignarMasivamente']);
    Route::get('/asignaciones/historial', [App\Http\Controllers\Api\AsignacionesController::class, 'obtenerHistorial']);
});
