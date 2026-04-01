<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Asignacion;

class Lote extends Model
{
    use HasFactory;

    protected $table = 'lotes';

    protected $fillable = [
        'codigo_lote',
        'descripcion',
        'fecha_importacion',
        'id_ambiente'
    ];

    /**
     * Get the assignments that belong to this batch (lote).
     */
    public function asignaciones()
    {
        return $this->hasMany(Asignacion::class, 'id_lote');
    }

    public function equipos()
    {
        return $this->hasMany(Equipo::class, 'id_lote');
    }

    /**
     * Get the ambiente (classroom) where this batch is physically located.
     */
    public function ambiente()
    {
        return $this->belongsTo(Ambientes::class, 'id_ambiente', 'numero_ambiente');
    }
}
