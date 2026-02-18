<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LicenciasSistema extends Model
{
    protected $table = 'licencias_sistema';

    protected $fillable = [
        'fecha_inicio',
        'fecha_vencimiento',
        'estado',
        'fecha_ultima_validacion',
        'id_plan_lic',
        'nit_entidad',
        'referencia_pago',
    ];

    public function entidad()
    {
        return $this->belongsTo(\App\Models\Entidades::class, 'nit_entidad', 'nit');
    }

    public function plan()
    {
        return $this->belongsTo(\App\Models\PlanesLicencia::class, 'id_plan_lic', 'id');
    }
}
