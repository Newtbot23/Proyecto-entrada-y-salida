<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoDoc extends Model
{
    protected $table = 'tipo_doc';
    protected $primaryKey = 'id_tip_doc';

    protected $fillable = ['nombre'];

    public function usuarios()
    {
        return $this->hasMany(Usuarios::class, 'id_tip_doc');
    }
}
