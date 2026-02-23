<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Asignaciones extends Model
{
    protected $table = 'asignaciones';
    protected $fillable = ['doc', 'serial_equipo', 'numero_ambiente', 'estado'];

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'doc', 'doc');
    }

    public function equipo()
    {
        return $this->belongsTo(Equipos::class, 'serial_equipo', 'serial');
    }
}
