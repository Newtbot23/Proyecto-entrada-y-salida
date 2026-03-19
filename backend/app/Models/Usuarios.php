<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Usuarios extends Authenticatable
{
    use HasApiTokens;
    protected $table = 'usuarios';
    protected $primaryKey = 'doc';
    public $incrementing = false;
    protected $keyType = 'int';

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($usuario) {
            \Illuminate\Support\Facades\DB::table('vehiculos')->where('doc', $usuario->doc)->delete();
            \Illuminate\Support\Facades\DB::table('registros_equipos')->where('doc', $usuario->doc)->delete();
            \Illuminate\Support\Facades\DB::table('registros')->where('doc', $usuario->doc)->delete();
            \Illuminate\Support\Facades\DB::table('asignaciones')->where('doc', $usuario->doc)->delete();
            \Illuminate\Support\Facades\DB::table('detalle_ficha_usuarios')->where('doc', $usuario->doc)->delete();
        });
    }

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
        'nit_entidad'
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

    public function entidad()
    {
        return $this->belongsTo(Entidades::class, 'nit_entidad', 'nit');
    }

    public function licenciaSistema()
    {
        return $this->hasOne(LicenciasSistema::class, 'nit_entidad', 'nit_entidad');
    }

    public function registros()
    {
        return $this->hasMany(Registros::class, 'doc', 'doc');
    }

    public function fichas()
    {
        return $this->belongsToMany(Fichas::class, 'detalle_ficha_usuarios', 'doc', 'id_ficha')
                    ->withPivot('id', 'tipo_participante')
                    ->withTimestamps();
    }
}
