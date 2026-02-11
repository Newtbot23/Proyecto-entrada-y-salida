<?php

use App\Http\Controllers\AdminsController;
use App\Http\Controllers\UsuariosAuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EntidadesController;
use App\Http\Controllers\PlanesLicenciaController;
use App\Http\Controllers\UsuariosController;
use App\Http\Controllers\SuperAdminAuthController;

Route::get('/', function () {
    return redirect()->route('superadmin.login');
});

// Rutas de autenticación para usuarios normales
Route::get('/login', [UsuariosAuthController::class, 'showLogin'])
    ->name('login');

Route::post('/login', [UsuariosAuthController::class, 'login'])
    ->name('login.submit');

Route::post('/logout', [UsuariosAuthController::class, 'logout'])
    ->name('logout');

Route::prefix('superadmin')->name('superadmin.')->group(function () {

    Route::get('/login', [AdminsController::class, 'showLogin'])
        ->name('login');

    Route::post('/login', [AdminsController::class, 'login'])
        ->name('login.submit');

    Route::post('/logout', [AdminsController::class, 'logout'])
        ->name('logout');

    Route::get('/planes_user', [PlanesLicenciaController::class, 'userPlanes'])
        ->name('planes_user.index');

    Route::get('/entidad-usuario/create/{plan}', 
        [UsuariosController::class, 'createEntidadUsuario']
    )->name('entidad-usuario.create');

    Route::post('/entidad-usuario', 
        [UsuariosController::class, 'storeEntidadUsuario']
    )->name('entidad-usuario.store');

    Route::get('/usuarios-pagos/create/{entidad}/{plan}',
        [UsuariosController::class, 'createUsuariosPagos']
    )->name('usuarios-pagos.create');

    Route::post('/usuarios-pagos',
        [UsuariosController::class, 'storeUsuariosPagos']
    )->name('usuarios-pagos.store');
});

Route::prefix('superadmin')
    ->name('superadmin.')
    ->middleware('auth.superadmin')
    ->group(function () {

    Route::get('/dashboard', [EntidadesController::class, 'dashboard'])
        ->name('dashboard');

    Route::resource('planes', PlanesLicenciaController::class)
        ->except(['show', 'create']);

    Route::resource('institutions', EntidadesController::class)
        ->except(['show']);

    Route::prefix('usuarios')->name('usuarios.')->group(function () {
        Route::post('/', [UsuariosController::class, 'store'])
            ->name('store');
    });
});
