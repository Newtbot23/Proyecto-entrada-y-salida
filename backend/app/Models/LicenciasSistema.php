<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LicenciasSistema extends Model
{
    protected $table = 'licencias_sistema';

    protected $primaryKey = 'id_licencia';

    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'descripcion',
    ];
}
