<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DetalleFichaUsuarios extends Model
{
    protected $table = 'detalle_ficha_usuarios';
    protected $fillable = ['id_ficha', 'doc', 'tipo_participante'];

    public function ficha()
    {
        return $this->belongsTo(Fichas::class, 'id_ficha', 'id');
    }

    public function usuario()
    {
        return $this->belongsTo(Usuarios::class, 'doc', 'doc');
    }
}
