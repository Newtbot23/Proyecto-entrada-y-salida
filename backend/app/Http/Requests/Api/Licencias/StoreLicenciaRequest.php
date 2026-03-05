<?php

namespace App\Http\Requests\Api\Licencias;

use Illuminate\Foundation\Http\FormRequest;

class StoreLicenciaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'fecha_inicio' => 'required|date',
            'fecha_vencimiento' => 'required|date|after:fecha_inicio',
            'estado' => 'required|string|in:activo,inactivo,expirado,pendiente',
            'id_plan_lic' => 'required|exists:planes_licencia,id',
            'id_entidad' => 'required|exists:entidades,id',
        ];
    }
}
