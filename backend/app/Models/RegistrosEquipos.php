<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrosEquipos extends Model
{
    protected $table = 'registros_equipos';
    protected $fillable = ['id_registro', 'serial_equipo'];

    public function registro()
    {
        return $this->belongsTo(Registros::class, 'id_registro');
    }

    public function equipo()
    {
        return $this->belongsTo(Equipos::class, 'serial_equipo', 'serial');
    }}
