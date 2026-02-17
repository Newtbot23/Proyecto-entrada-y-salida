<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Admins extends Authenticatable
{
    use HasApiTokens, Notifiable;
    protected $table = 'admins';

    protected $fillable = [
        'doc',
        'correo',
        'contrasena',
        'nombre',
        'telefono'
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
}
