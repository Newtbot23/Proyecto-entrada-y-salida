<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipos extends Model
{
    protected $table = 'equipos';
    protected $primaryKey = 'serial';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'serial',
        'tipo_equipo',
        'placa_sena',
        'id_marca',
        'estado',
        'modelo',
        'tipo_equipo_desc',
        'caracteristicas',
        'id_sistema_operativo'
    ];

    public function marca()
    {
        return $this->belongsTo(MarcasEquipo::class, 'id_marca');
    }

    public function sistema_operativo()
    {
        return $this->belongsTo(SistemasOperativos::class, 'id_sistema_operativo');
    }
}
