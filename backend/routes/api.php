<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PricingController;
use App\Http\Controllers\Api\EntidadesController;
use App\Http\Controllers\Api\PlanesController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LicenciasController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

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

// Dashboard Stats
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

// Licenses Management
Route::get('/licencias', [LicenciasController::class, 'index']);
Route::post('/licencias', [LicenciasController::class, 'store']);
Route::get('/licencias/{id}', [LicenciasController::class, 'show']);
Route::put('/licencias/{id}/activate', [LicenciasController::class, 'activate']);

