<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entidades extends Model
{
    use HasFactory;

    protected $table = 'entidades'; // solo si tu tabla NO se llama entidades
    protected $primaryKey = 'id';
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
        return $this->hasMany(Usuarios::class, 'id_entidad');
    }

    public function licencia()
    {
        return $this->hasOne(LicenciasSistema::class, 'id_entidad', 'id');
    }
}
