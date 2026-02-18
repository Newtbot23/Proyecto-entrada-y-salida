<?php

namespace App\Http\Requests\Api\Registration;

use Illuminate\Foundation\Http\FormRequest;

class FinishRegistrationRequest extends FormRequest
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
            'id_entidad' => 'required|exists:entidades,nit',
            'id_plan_lic' => 'required|exists:planes_licencia,id',
            
            // Admin User Data
            'doc' => 'required|string|max:20|unique:usuarios,doc',
            'id_tip_doc' => 'required|exists:tipo_doc,id_tip_doc',
            'primer_nombre' => 'required|string|max:50',
            'primer_apellido' => 'required|string|max:50',
            'user_telefono' => 'required|string|max:13',
            'user_correo' => 'required|email|max:100|unique:usuarios,correo',
            'contrasena' => 'required|string|min:6',
        ];
    }
}
