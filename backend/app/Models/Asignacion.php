<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Asignacion extends Model
{
    use HasFactory;

    protected $table = 'asignaciones';

    protected $fillable = [
        'doc',
        'serial_equipo',
        'numero_ambiente',
        'estado',
        'codigo_asignacion'
    ];

    /**
     * Get the user that owns the assignment.
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'doc', 'doc');
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
        return $this->belongsTo(Ficha::class, 'numero_ambiente', 'numero_ambiente');
    }
}
