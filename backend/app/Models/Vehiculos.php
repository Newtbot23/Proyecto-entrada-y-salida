<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehiculos extends Model
{
    protected $table = 'vehiculos';
    protected $primaryKey = 'placa';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'placa',
        'id_tipo_vehiculo',
        'doc',
        'marca',
        'modelo',
        'color',
        'descripcion'
    ];

    public function tipo_vehiculo()
    {
        return $this->belongsTo(TiposVehiculo::class, 'id_tipo_vehiculo', 'id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'doc', 'doc');
    }
}
