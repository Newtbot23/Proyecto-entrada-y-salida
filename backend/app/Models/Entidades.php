<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entidades extends Model
{

    protected $table = 'entidades';
    protected $primaryKey = 'nit';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'nombre_entidad',
        'correo',
        'direccion',
        'nombre_titular',
        'telefono',
        'nit'
    ];

    public function usuarios()
    {
        return $this->hasManyThrough(
            Usuarios::class,
            LicenciasSistema::class,
            'nit_entidad',
            'id_licencia_sistema',
            'nit',
            'id'
        );
    }

    public function licencia()
    {
        return $this->hasOne(LicenciasSistema::class, 'nit_entidad', 'nit');
    }
}
