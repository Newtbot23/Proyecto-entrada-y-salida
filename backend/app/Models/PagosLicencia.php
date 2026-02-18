<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagosLicencia extends Model
{
    protected $table = 'pagos_licencia';

    protected $fillable = [
        'id_licencia',
        'fecha_pago',
        'metodo_pago',
        'referencia',
        'monto',
        'stripe_session_id',
        'estado',
        'creado_en',
        'tipo_pago',
    ];

    protected $casts = [
        'fecha_pago' => 'datetime',
        'creado_en' => 'datetime',
    ];

    public function licencia()
    {
        return $this->belongsTo(LicenciasSistema::class, 'id_licencia');
    }
}
