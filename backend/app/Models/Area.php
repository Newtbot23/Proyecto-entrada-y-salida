<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Area extends Model
{
    use HasFactory;

    protected $table = 'areas';

    protected $fillable = ['nombre', 'descripcion'];

    /**
     * Users who belong to this administrative area.
     * The pivot table is area_usuario with id_area and id_usuario columns.
     */
    public function usuarios()
    {
        return $this->belongsToMany(
            Usuarios::class,
            'area_usuario',
            'id_area',
            'id_usuario',
            'id',
            'doc'
        )->withPivot('id_area', 'id_usuario');
    }
}
