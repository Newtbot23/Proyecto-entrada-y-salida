<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MarcaVehiculo extends Model
{
    protected $table = 'marcas_vehiculo';

    protected $fillable = [
        'nombre',
        'id_tipo_vehiculo',
    ];

    /**
     * Un tipo de vehículo al que pertenece esta marca.
     */
    public function tipo_vehiculo()
    {
        return $this->belongsTo(TiposVehiculo::class, 'id_tipo_vehiculo', 'id');
    }

    /**
     * Vehículos que tienen esta marca.
     */
    public function vehiculos()
    {
        return $this->hasMany(Vehiculos::class, 'id_marca', 'id');
    }
}
