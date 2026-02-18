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
        return $this->hasMany(Usuarios::class, 'nit_entidad', 'nit');
    }

    public function licencia()
    {
        return $this->hasOne(LicenciasSistema::class, 'nit_entidad', 'nit');
    }
}
