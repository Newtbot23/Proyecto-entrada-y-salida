<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
}
