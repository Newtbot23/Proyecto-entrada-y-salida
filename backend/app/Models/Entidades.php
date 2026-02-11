<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entidades extends Model
{

    protected $table = 'entidades'; // solo si tu tabla NO se llama entidades
    protected $primaryKey = 'id';
    protected $fillable = [
        'nombre_entidad',
        'correo',
        'direccion',
        'nombre_titular',
        'telefono',
        'nit',
        'status'
    ];

    public function usuarios()
    {
        return $this->hasManyThrough(
            Usuarios::class,
            LicenciasSistema::class,
            'id_entidad', // Foreign key on licencias_sistema table...
            'id_licencia_sistema', // Foreign key on usuarios table...
            'id', // Local key on entidades table...
            'id' // Local key on licencias_sistema table...
        );
    }

    public function licencia()
    {
        return $this->hasOne(LicenciasSistema::class, 'id_entidad', 'id');
    }
}
