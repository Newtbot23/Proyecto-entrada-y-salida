<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Usuarios;
use App\Models\Equipos;
use App\Models\Fichas;

class Asignaciones extends Model
{
    use HasFactory;

    protected $table = 'asignaciones';

    protected $fillable = [
        'doc',
        'serial_equipo',
        'numero_ambiente',
        'estado',
        'codigo_asignacion',
        'es_predeterminado',
    ];

    /**
     * Get the user that owns the assignment.
     */
    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'doc', 'doc');
    }

    /**
     * Get the equipment for the assignment.
     */
    public function equipo()
    {
        return $this->belongsTo(Equipos::class, 'serial_equipo', 'serial');
    }

    /**
     * Get the environment/ficha for the assignment.
     */
    public function ambiente()
    {
        return $this->belongsTo(Fichas::class, 'numero_ambiente', 'numero_ambiente');
    }
}
