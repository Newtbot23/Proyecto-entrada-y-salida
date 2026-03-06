<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registros extends Model
{
    protected $table = 'registros';
    protected $fillable = ['doc', 'serial_equipo', 'fecha', 'hora_entrada', 'hora_salida'];

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'doc', 'doc');
    }

    public function equipo()
    {
        return $this->belongsTo(Equipos::class, 'serial_equipo', 'serial');
    }
}
