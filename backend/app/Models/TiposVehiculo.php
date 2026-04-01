<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TiposVehiculo extends Model
{
    protected $table = 'tipos_vehiculo';

    protected $fillable = ['tipo_vehiculo'];

    /**
     * Marcas que pertenecen a este tipo de vehículo.
     */
    public function marcas()
    {
        return $this->hasMany(MarcaVehiculo::class, 'id_tipo_vehiculo', 'id');
    }

    /**
     * Vehículos de este tipo.
     */
    public function vehiculos()
    {
        return $this->hasMany(Vehiculos::class, 'id_tipo_vehiculo', 'id');
    }
}
