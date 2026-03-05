<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LicenciasSistema extends Model
{
    protected $table = 'licencias_sistema';
    protected $keyType = 'string';
    public $incrementing = false;

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->id)) {
                $parts = [];
                for ($i = 0; $i < 4; $i++) {
                    // Generate 5 random alphanumeric characters and convert to uppercase
                    $parts[] = strtoupper(\Illuminate\Support\Str::random(5));
                }
                $model->id = implode('-', $parts);
            }
        });

        static::deleting(function ($licencia) {
            \Illuminate\Support\Facades\DB::table('pagos_licencias')
                ->where('id_licencia', $licencia->id)
                ->delete();
        });
    }

    protected $fillable = [
        'fecha_inicio',
        'fecha_vencimiento',
        'estado',
        'fecha_ultima_validacion',
        'id_plan_lic',
        'nit_entidad',
        'referencia_pago'
    ];

    public function plan()
    {
        return $this->belongsTo(PlanesLicencia::class, 'id_plan_lic', 'id');
    }

    public function entidad()
    {
        return $this->belongsTo(Entidades::class, 'nit_entidad', 'nit');
        
    }
}
