<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;

class Admins extends Authenticatable
{
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
}
