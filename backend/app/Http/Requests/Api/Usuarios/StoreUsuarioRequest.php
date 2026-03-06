<?php

namespace App\Http\Requests\Api\Usuarios;

use Illuminate\Foundation\Http\FormRequest;

class StoreUsuarioRequest extends FormRequest
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
            'doc' => 'required|string|unique:usuarios,doc|regex:/^[0-9]{7,10}$/',
            'id_tip_doc' => 'required|exists:tipo_doc,id_tip_doc',
            'primer_nombre' => 'required|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'segundo_nombre' => 'nullable|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'primer_apellido' => 'required|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'segundo_apellido' => 'nullable|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono' => 'required|string|max:13|regex:/^[0-9+\-\s()]+$/',
            'correo' => 'required|email|max:100|unique:usuarios,correo',
            'contrasena' => 'required|string|min:6',
            'id_rol' => 'nullable|integer|exists:roles,id',
            'nit_entidad' => 'required|string|exists:entidades,nit',
        ];
    }
}
