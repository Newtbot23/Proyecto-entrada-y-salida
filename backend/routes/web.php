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

    // Rutas de recuperación de contraseña para SuperAdmin
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

Route::prefix('superadmin')->name('superadmin.')->group(function () {
    Route::get('/admin/forgot-password', [AdminForgotPasswordController::class, 'showLinkRequestForm'])->name('admin.password.request');
    Route::post('/admin/forgot-password', [AdminForgotPasswordController::class, 'sendResetLink']);
    Route::get('/admin/reset-password/{token}', [AdminResetPasswordController::class, 'showResetForm'])->name('admin.password.reset');
    Route::post('/admin/reset-password', [AdminResetPasswordController::class, 'reset']);
});

Route::prefix('usuario')->group(function () {
    Route::get('/forgot-password', [UsuarioForgotPasswordController::class, 'showLinkRequestForm'])->name('usuario.password.request');
    Route::post('/forgot-password', [UsuarioForgotPasswordController::class, 'sendResetLink']);
    Route::get('/reset-password/{token}', [UsuarioResetPasswordController::class, 'showResetForm'])->name('password.reset');
    Route::post('/reset-password', [UsuarioResetPasswordController::class, 'reset']);
});
