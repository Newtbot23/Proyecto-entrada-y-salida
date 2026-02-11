<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanesLicencia extends Model
{
    protected $table = 'planes_licencia';

    protected $fillable = [
        'nombre_plan',
        'caracteristicas',
        'duracion_plan',
        'precio_plan',
        'estado'
    ];

    protected $casts = [
        'duracion_plan' => 'integer',
    ];
}