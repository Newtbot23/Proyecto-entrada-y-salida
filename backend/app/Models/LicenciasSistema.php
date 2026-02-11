<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LicenciasSistema extends Model
{
    protected $table = 'licencias_sistema';

    protected $fillable = [
        'id_plan_lic',
        'id_entidad',
        'fecha_inicio',
        'fecha_vencimiento',
        'estado',
        'fecha_ultima_validacion',
    ];
}
