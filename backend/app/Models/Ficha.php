<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Asignacion;
use App\Models\Programas;
use App\Models\Ambientes;
use App\Models\Jornadas;
use App\Models\Usuarios;
use App\Models\DetalleFichaUsuarios;

class Ficha extends Model
{
    protected $table = 'fichas';
    protected $fillable = [
        'numero_ficha', 
        'id_programa', 
        'numero_ambiente', 
        'id_jornada', 
        'hora_limite_llegada', 
        'estado'
    ];

    /**
     * Get the assignments for the Ficha.
     */
    public function asignaciones()
    {
        return $this->hasMany(Asignacion::class, 'id_ficha');
    }

    /**
     * Get the program for the Ficha.
     */
    public function programa()
    {
        return $this->belongsTo(Programas::class, 'id_programa', 'id');
    }

    /**
     * Get the environment for the Ficha.
     */
    public function ambiente()
    {
        return $this->belongsTo(Ambientes::class, 'numero_ambiente', 'numero_ambiente');
    }

    /**
     * Get the shift (jornada) for the Ficha.
     */
    public function jornada()
    {
        return $this->belongsTo(Jornadas::class, 'id_jornada', 'id');
    }

    /**
     * Get the users (aprendices/instructores) for the Ficha.
     */
    public function usuarios()
    {
        return $this->belongsToMany(Usuarios::class, 'detalle_ficha_usuarios', 'id_ficha', 'doc')
                    ->withPivot('id', 'tipo_participante')
                    ->withTimestamps();
    }

    /**
     * Get the detailed records for users in the Ficha.
     */
    public function detalles()
    {
        return $this->hasMany(DetalleFichaUsuarios::class, 'id_ficha', 'id');
    }
}
