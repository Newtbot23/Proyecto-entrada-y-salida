<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registros extends Model
{
    protected $table = 'registros';
    protected $fillable = ['doc', 'placa', 'fecha', 'hora_entrada', 'hora_salida'];

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'doc', 'doc');
    }

    public function equipos_registrados()
    {
        return $this->hasMany(RegistrosEquipos::class, 'id_registro');
    }

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculos::class, 'placa', 'placa');
    }
}
