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
        'estado',
        'creado_en'
    ];

    public function licencia()
    {
        return $this->belongsTo(LicenciasSistema::class, 'id_licencia');
    }
}
