<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanesLicencia extends Model
{
    protected $table = 'planes_licencia';

    protected $fillable = [
        'nombre_plan',
        'periodo_facturacion',
        'caracteristicas',
        'descripcion',
        'duracion_plan',
        'precio_plan'
    ];
}