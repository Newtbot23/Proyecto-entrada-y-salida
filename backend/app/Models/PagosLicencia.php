<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagosLicencia extends Model
{


protected $table = 'pagos_licencia';

    protected $fillable = [
        'id',
        'id_licencia',
        'fecha_pago',
        'metodo_pago',
        'referencia',
        'estado',
        'creado_en',
    ];
    public function LicenciasSistema()
{
    return $this->belongsTo(TipoDoc::class, 'id', 'id_licencia');
}
}
