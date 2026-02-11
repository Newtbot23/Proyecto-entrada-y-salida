<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entidades extends Model
{
    use HasFactory;
    protected $table = 'entidades'; // solo si tu tabla NO se llama entidades

    protected $fillable = [
        'nombre_entidad',
        'correo',
        'direccion',
        'nombre_titular',
        'telefono',
        'nit',
        'status'
    ];
}
