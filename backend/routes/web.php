<?php
use App\Http\Controllers\EntidadesController;
use App\Http\Controllers\PlanesLicenciaController;
use App\Http\Controllers\UsuariosController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('superadmin.planes.index');
});

Route::prefix('superadmin')->name('superadmin.')->group(function () {

    Route::get('/dashboard', [EntidadesController::class, 'dashboard'])
        ->name('dashboard');

    Route::resource('planes', PlanesLicenciaController::class)
        ->except(['show', 'create']);

    Route::get('/planes_user', [PlanesLicenciaController::class, 'userPlanes'])
        ->name('planes_user.index');

    Route::resource('institutions', EntidadesController::class)
        ->except(['show']);

    Route::prefix('usuarios')->name('usuarios.')->group(function () {

        Route::post('/', [UsuariosController::class, 'store'])
            ->name('store');
    });

    Route::get('/entidad-usuario/create', 
        [UsuariosController::class, 'createEntidadUsuario']
    )->name('entidad-usuario.create');
    
    Route::post('/entidad-usuario', 
        [UsuariosController::class, 'storeEntidadUsuario']
    )->name('entidad-usuario.store');

});
