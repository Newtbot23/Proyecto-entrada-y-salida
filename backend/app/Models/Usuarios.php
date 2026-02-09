<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuarios extends Model
{
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
        'id_rol',
        'id_entidad'
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
