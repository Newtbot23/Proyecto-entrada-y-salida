<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Fichas extends Model
{
    protected $table = 'fichas';
    protected $fillable = ['numero_ficha', 'id_programa', 'numero_ambiente', 'id_jornada', 'hora_limite_llegada'];

    public function programa()
    {
        return $this->belongsTo(Programas::class, 'id_programa', 'id');
    }

    public function ambiente()
    {
        return $this->belongsTo(Ambientes::class, 'numero_ambiente', 'numero_ambiente');
    }

    public function jornada()
    {
        return $this->belongsTo(Jornadas::class, 'id_jornada', 'id');
    }

    public function usuarios()
    {
        return $this->belongsToMany(Usuarios::class, 'detalle_ficha_usuarios', 'id_ficha', 'doc')
                    ->withPivot('id', 'tipo_participante')
                    ->withTimestamps();
    }

    public function detalles()
    {
        return $this->hasMany(DetalleFichaUsuarios::class, 'id_ficha', 'id');
    }
}
