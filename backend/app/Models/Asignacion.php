<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Usuarios;
use App\Models\Equipo;
use App\Models\Ficha;
use App\Models\Lote;

class Asignacion extends Model
{
    use HasFactory;

    protected $table = 'asignaciones';

    // Estados constantes del flujo de asignación
    public const ESTADO_EN_USO = 'EN_USO';
    public const ESTADO_DEVUELTO = 'DEVUELTO';
    public const ESTADO_MANTENIMIENTO = 'MANTENIMIENTO';
    public const ESTADO_EXTRAVIADO = 'EXTRAVIADO';

    protected $fillable = [
        'doc',
        'serial_equipo',
        'id_ficha',
        'id_lote',
        'estado',
        'codigo_asignacion'
    ];

    /**
     * Get the user (aprendiz) that owns the assignment.
     */
    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'doc', 'doc');
    }

    /**
     * Get the user (aprendiz) that owns the assignment (alias for learning-style naming).
     */
    public function aprendiz()
    {
        return $this->belongsTo(Usuarios::class, 'doc', 'doc');
    }

    /**
     * Get the equipment for the assignment.
     */
    public function equipo()
    {
        return $this->belongsTo(Equipo::class, 'serial_equipo', 'serial');
    }

    /**
     * Get the ficha for the assignment.
     */
    public function ficha()
    {
        return $this->belongsTo(Ficha::class, 'id_ficha', 'id');
    }

    /**
     * Get the lote for the assignment.
     */
    public function lote()
    {
        return $this->belongsTo(Lote::class, 'id_lote', 'id');
    }
}
