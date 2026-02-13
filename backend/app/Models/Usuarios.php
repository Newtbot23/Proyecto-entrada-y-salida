<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use App\Notifications\ResetPasswordNotification;

class Usuarios extends Authenticatable
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
        'estado',
        'id_rol',
        'id_entidad'
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
    
    use Notifiable;
    public function getAuthPassword()
{
    return $this->contrasena;
}


public function getAuthIdentifierName()
{
    return 'correo';
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

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}
