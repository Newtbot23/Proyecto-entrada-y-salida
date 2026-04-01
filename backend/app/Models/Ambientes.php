<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\Lote;

class Ambientes extends Model
{
    protected $table = 'ambientes';
    protected $primaryKey = 'numero_ambiente';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'numero_ambiente',
        'ambiente',
        'id_nave'
    ];

    public function nave()
    {
        return $this->belongsTo(Naves::class, 'id_nave', 'id');
    }

    /**
     * Get the active batch (lote) assigned to this classroom.
     * A classroom can have one active lote at a time.
     */
    public function lote()
    {
        return $this->hasOne(Lote::class, 'id_ambiente', 'numero_ambiente');
    }

    /**
     * Get all batches ever assigned to this classroom.
     */
    public function lotes()
    {
        return $this->hasMany(Lote::class, 'id_ambiente', 'numero_ambiente');
    }
}
