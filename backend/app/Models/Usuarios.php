<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class Usuarios extends Authenticatable
{
    use HasApiTokens;
    protected $table = 'usuarios';

    protected $fillable = [
        'doc',
        'id_tip_doc',
        'primer_nombre',
        'segundo_nombre',
        'primer_apellido',
        'segundo_apellido',
        'telefono',
        'correo',
        'imagen',
        'codigo_qr',
        'contrasena',
        'estado',
        'id_rol',
        'id_licencia_sistema'
    ];

    protected $casts = [
        'estado' => 'string',
    ];

    public function tipoDoc()
{
    return $this->belongsTo(TipoDoc::class, 'id_tip_doc', 'id_tip_doc');
}
    public function rol()
    {
        return $this->belongsTo(Roles::class, 'id_rol', 'id');
    }

}
