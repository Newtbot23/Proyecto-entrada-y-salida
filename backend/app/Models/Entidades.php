<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entidades extends Model
{

    protected $table = 'entidades';
    protected $primaryKey = 'nit';
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'nombre_entidad',
        'correo',
        'direccion',
        'nombre_titular',
        'telefono',
        'nit',
        'estado'
    ];

    public function usuarios()
    {
        return $this->hasMany(Usuarios::class, 'nit_entidad', 'nit');
    }

    public function admins()
    {
        return $this->hasMany(Usuarios::class, 'nit_entidad', 'nit')->where('id_rol', 1);
    }

    public function licencia()
    {
        return $this->hasOne(LicenciasSistema::class, 'nit_entidad', 'nit');
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function ($entidad) {
            if ($entidad->licencia) {
                $entidad->licencia->delete();
            }

            if ($entidad->usuarios) {
                foreach ($entidad->usuarios as $usuario) {
                    $usuario->delete();
                }
            }
        });
    }
    /**
     * Set the NIT attribute.
     * Normalizes input and appends DV if missing.
     *
     * @param string $value
     * @return void
     */
    public function setNitAttribute($value)
    {
        // Remove non-numeric characters except hyphen
        $cleanValue = preg_replace('/[^0-9-]/', '', $value);

        $parts = explode('-', $cleanValue);
        $base = $parts[0];
        $dv = isset($parts[1]) && $parts[1] !== '' ? (int)$parts[1] : null;

        if ($dv === null) {
            // calculate DV
            $dv = \App\Services\NitService::calculateDV($base);
            // Validate provided DV
            $calculatedDv = \App\Services\NitService::calculateDV($base);
            // Validation should have happened in Request. We proceed silently or could log warning.
            // If we are here, we trust the input or adjust if slightly off? 
            // Actually, if Validation passed, then DV matches.
            // But if we want to be safe, we can just enforce the calculated DV.
            $dv = $calculatedDv;
        }

        $this->attributes['nit'] = "{$base}-{$dv}";
    }
}
