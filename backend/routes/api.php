<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\EntidadesController;
use App\Http\Controllers\Api\EntidadController;
use App\Http\Controllers\Api\PlanesLicenciasController;
use App\Http\Controllers\Api\UsuariosController;
use App\Http\Controllers\Api\NormalAdminAuthController;
use App\Http\Controllers\Api\RegistrationFlowController;
use App\Http\Controllers\Api\TipoDocController;
use App\Http\Controllers\Api\PlanesController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LicenciasController;
use App\Http\Controllers\Api\AdminsAuthController;
use App\Http\Controllers\Api\AdminsController;
use App\Http\Controllers\Api\PasswordRecoveryApiController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\StripeCheckoutController;
use App\Http\Controllers\Api\DynamicTableController;
use App\Http\Controllers\Api\UserDashboardController;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Admins Authentication
Route::post('/admins/login', [AdminsAuthController::class, 'login']);

// Password Recovery
Route::post('/forgot-password', [PasswordRecoveryApiController::class, 'sendResetCode']);
Route::post('/verify-code', [PasswordRecoveryApiController::class, 'verifyCode']);
Route::post('/reset-password', [PasswordRecoveryApiController::class, 'resetPassword']);

// Admins Management CRUD
Route::apiResource('admins', AdminsController::class);

Route::get('/plans', [PricingController::class, 'index']);
Route::post('/plans/select', [PricingController::class, 'select']);

Route::get('/planes', [PlanesController::class, 'index']);
Route::post('/planes', [PlanesController::class, 'store']);
Route::get('/planes/{id}', [PlanesController::class, 'show']);
Route::put('/planes/{id}', [PlanesController::class, 'update']);
Route::delete('/planes/{id}', [PlanesController::class, 'destroy']);

//Esta es la manera de listar todas las rutas de un controlador dentro de la carpeta api
//Route::apiResource('entidades', EntidadesController::class);
Route::get('/entidades', [EntidadesController::class, 'index']);
Route::post('/entidades', [EntidadesController::class, 'store']);
Route::get('/entidades/{id}', [EntidadesController::class, 'show']);
Route::put('/entidades/{id}', [EntidadesController::class, 'update']);
Route::delete('/entidades/{id}', [EntidadesController::class, 'destroy']);
Route::get('/entidades/{nit}/admins', [EntidadesController::class, 'getAdmins']);

// User status toggle
Route::patch('/usuarios/{doc}/estado', [UsuariosController::class, 'toggleEstado']);

// QR Registration
Route::middleware('auth:sanctum')->get('/usuarios/qr-registro', [UsuariosController::class, 'generateQr']);
Route::post('/usuarios/qr-register', [UsuariosController::class, 'registerWithQr']);

// Registration Flow
Route::post('/registration/entidades', [EntidadController::class, 'store']);
Route::post('/registration/licencias', [PlanesLicenciasController::class, 'store']);
Route::post('/registration/usuarios', [UsuariosController::class, 'store']);
Route::post('/registration/complete-entity', [RegistrationFlowController::class, 'finishRegistration']);
Route::post('/registration/full', [RegistrationFlowController::class, 'register']);

// Normal Admin Auth
Route::post('/normaladmin/login', [NormalAdminAuthController::class, 'login']);

// Dashboard Stats
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/normal-admin/stats', [DashboardController::class, 'normalAdminStats'])->middleware('auth:sanctum');

// Licenses Management
Route::get('/licencias', [LicenciasController::class, 'index']);
Route::post('/licencias', [LicenciasController::class, 'store']);
// Route::get('/licencias/{id}', [LicenciasController::class, 'show']); // Duplicate removed? No, it was there.
Route::get('/licencias/{id}', [LicenciasController::class, 'show']);
Route::put('/licencias/{id}/activate', [LicenciasController::class, 'activate']);
Route::patch('/licencias-sistema/{id}/estado', [LicenciasController::class, 'updateEstado']);
Route::get('/licencia-actual', [LicenciasController::class, 'getActualLicense'])->middleware('auth:sanctum');

// Stripe Payment
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/stripe/checkout-session', [StripeCheckoutController::class, 'createCheckoutSession']);
    Route::post('/stripe/payment-success', [StripeCheckoutController::class, 'confirmPayment']);

    // User Dashboard Routes
    Route::get('/user/catalogs', [UserDashboardController::class, 'getCatalogs']);
    Route::get('/user/vehiculos', [UserDashboardController::class, 'getVehiculos']);
    Route::get('/user/equipos', [UserDashboardController::class, 'getEquipos']);
    Route::get('/user/entradas', [UserDashboardController::class, 'getEntradas']);
    Route::post('/user/vehiculos', [UserDashboardController::class, 'storeVehiculo']);
    Route::post('/user/equipos', [UserDashboardController::class, 'storeEquipo']);
    Route::post('/ocr/read-plate', [UserDashboardController::class, 'readPlate']);
    Route::post('/ocr/read-serial', [UserDashboardController::class, 'readSerial']);
});

// Common Data
Route::get('/tipo-doc', [TipoDocController::class, 'index']);

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

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/reports/person', [ReportController::class, 'getPersonReport']);
    Route::get('/reports/daily', [ReportController::class, 'getDailyReport']);
});

// Puertas Access Control
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/puertas/search-persona', [App\Http\Controllers\Api\PuertasController::class, 'searchPersona']);
    Route::get('/puertas/search-vehiculo', [App\Http\Controllers\Api\PuertasController::class, 'searchVehiculo']);
    Route::post('/puertas/registrar-actividad', [App\Http\Controllers\Api\PuertasController::class, 'registrarActividad']);
});
