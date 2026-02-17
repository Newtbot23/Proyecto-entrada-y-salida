<?php

namespace App\Http\Requests\Api\PlanesLicencias;

use Illuminate\Foundation\Http\FormRequest;

class StorePlanesLicenciasRequest extends FormRequest
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
            'id_plan_lic' => 'required|exists:planes_licencia,id',
            'id_entidad' => 'required|exists:entidades,id',
        ];
    }
}
