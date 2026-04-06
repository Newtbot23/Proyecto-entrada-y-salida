<?php

use App\Http\Controllers\Api\AdminsController;
// use App\Http\Controllers\UsuariosAuthController; // Missing file
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EntidadController;
use App\Http\Controllers\Api\PlanesLicenciasController;
use App\Http\Controllers\Api\UsuariosController;
use App\Http\Controllers\Api\PasswordRecoveryApiController as PasswordRecoveryController;

Route::get('/', function () {
    return redirect()->route('superadmin.login');
});
/*
Route::get('/login', [UsuariosAuthController::class, 'showLogin'])
    ->name('login');

Route::post('/login', [UsuariosAuthController::class, 'login'])
    ->name('login.submit');

Route::post('/logout', [UsuariosAuthController::class, 'logout'])
    ->name('logout');
*/

Route::prefix('superadmin')->name('superadmin.')->group(function () {

    Route::get('/login', [AdminsController::class, 'showLogin'])
        ->name('login');

    Route::post('/login', [AdminsController::class, 'login'])
        ->name('login.submit');

    Route::post('/logout', [AdminsController::class, 'logout'])
        ->name('logout');

    Route::get('/planes_user', [PlanesLicenciasController::class, 'userPlanes'])
        ->name('planes_user.index');

    Route::get(
        '/entidad-usuario/create/{plan}',
        [UsuariosController::class, 'createEntidadUsuario']
    )->name('entidad-usuario.create');

    Route::post(
        '/entidad-usuario',
        [UsuariosController::class, 'storeEntidadUsuario']
    )->name('entidad-usuario.store');

    Route::get(
        '/usuarios-pagos/create/{entidad}/{plan}',
        [UsuariosController::class, 'createUsuariosPagos']
    )->name('usuarios-pagos.create');

    Route::post(
        '/usuarios-pagos',
        [UsuariosController::class, 'storeUsuariosPagos']
    )->name('usuarios-pagos.store');

    // Rutas de recuperación de contraseña para SuperAdmin (código de 6 dígitos)
    Route::get('/forgot-password', [PasswordRecoveryController::class, 'showForgotForm'])->name('forgot.form');
    Route::post('/forgot-password', [PasswordRecoveryController::class, 'sendResetCode'])->name('forgot.submit');
    Route::get('/verify-code', [PasswordRecoveryController::class, 'showVerifyForm'])->name('verify.form');
    Route::post('/verify-code', [PasswordRecoveryController::class, 'verifyCode'])->name('verify.submit');
    Route::get('/reset-password', [PasswordRecoveryController::class, 'showResetForm'])->name('reset.form');
    Route::post('/reset-password', [PasswordRecoveryController::class, 'resetPassword'])->name('reset.submit');
});

Route::prefix('superadmin')
    ->name('superadmin.')
    ->middleware('auth.superadmin')
    ->group(function () {

        Route::get('/dashboard', [EntidadController::class, 'dashboard'])
            ->name('dashboard');

        Route::resource('planes', PlanesLicenciasController::class)
            ->except(['show', 'create']);

        Route::resource('institutions', EntidadController::class)
            ->except(['show']);

        Route::prefix('usuarios')->name('usuarios.')->group(function () {
            Route::post('/', [UsuariosController::class, 'store'])
                ->name('store');
        });
    });

// Rutas de recuperación de contraseña para Usuarios normales (código de 6 dígitos)
Route::prefix('usuario')->group(function () {
    Route::get('/forgot-password', [PasswordRecoveryController::class, 'showForgotForm'])->name('usuario.forgot.form');
    Route::post('/forgot-password', [PasswordRecoveryController::class, 'sendResetCode'])->name('usuario.forgot.submit');
    Route::get('/verify-code', [PasswordRecoveryController::class, 'showVerifyForm'])->name('usuario.verify.form');
    Route::post('/verify-code', [PasswordRecoveryController::class, 'verifyCode'])->name('usuario.verify.submit');
    Route::get('/reset-password', [PasswordRecoveryController::class, 'showResetForm'])->name('usuario.reset.form');
    Route::post('/reset-password', [PasswordRecoveryController::class, 'resetPassword'])->name('usuario.reset.submit');
});
