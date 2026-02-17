<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

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

    protected $hidden = [
        'contrasena',
    ];

    public function getAuthPasswordName()
    {
        return 'contrasena';
    }

    /**
     * Get the e-mail address where password reset links are sent.
     *
     * @return string
     */
    public function getEmailForPasswordReset()
    {
        return $this->correo;
    }

    public function tipoDoc()
    {
        return $this->belongsTo(TipoDoc::class, 'id_tip_doc', 'id_tip_doc');
    }

    public function rol()
    {
        return $this->belongsTo(Roles::class, 'id_rol', 'id');
    }

}
