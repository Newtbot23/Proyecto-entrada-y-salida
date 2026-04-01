<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Equipo extends Model
{
    use HasFactory;

    protected $table = 'equipos';

    protected $primaryKey = 'serial';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'serial',
        'categoria_equipo',
        'tipo_equipo',
        'placa_sena',
        'id_marca',
        'estado',
        'modelo',
        'tipo_equipo_desc',
        'caracteristicas',
        'id_sistema_operativo',
        'img_serial',
        'id_lote',
        'estado_aprobacion'
    ];

    public function marca()
    {
        return $this->belongsTo(MarcasEquipo::class, 'id_marca');
    }

    public function sistema_operativo()
    {
        return $this->belongsTo(SistemasOperativos::class, 'id_sistema_operativo', 'id');
    }
    public function lote()
    {
        return $this->belongsTo(Lote::class, 'id_lote');
    }

    public function asignaciones()
    {
        return $this->hasMany(Asignacion::class, 'serial_equipo', 'serial');
    }
}
