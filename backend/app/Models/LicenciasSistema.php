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
        'id_entidad'
    ];

    protected $casts = [
        'estado' => 'boolean',
        'fecha_inicio' => 'date',
        'fecha_vencimiento' => 'date',
        'fecha_ultima_validacion' => 'datetime',
    ];

    public $timestamps = true;

    public function plan()
    {
        return $this->belongsTo(PlanesLicencia::class, 'id_plan_lic');
    }

    public function entidad()
    {
        return $this->belongsTo(Entidades::class, 'id_entidad');
    }
}
