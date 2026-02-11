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
        'id_entidad',
        'referencia_pago',
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuarios::class, 'id_licencia_sistema');
    }

    public function entidad()
    {
        return $this->belongsTo(Entidades::class, 'id_entidad');
    }

    public function plan()
    {
        return $this->belongsTo(PlanesLicencia::class, 'id_plan_lic');
    }
}
