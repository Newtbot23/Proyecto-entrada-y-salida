<?php

namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;

class Admins extends Authenticatable
{
    use HasApiTokens;
    protected $table = 'admins';
    protected $primaryKey = 'doc';
    public $incrementing = false;
    protected $keyType = 'int';

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
