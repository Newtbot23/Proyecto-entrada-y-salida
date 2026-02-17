<?php

namespace App\Http\Requests\Api\Admins;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdminRequest extends FormRequest
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
        $id = $this->route('admin');

        return [
            'doc' => 'sometimes|required|integer|unique:admins,doc,' . $id . '|regex:/^[0-9]+$/',
            'nombre' => 'sometimes|required|string|max:200|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono' => 'sometimes|required|string|max:200|regex:/^[0-9+\-\s()]+$/',
            'correo' => 'sometimes|required|email|max:200|unique:admins,correo,' . $id,
            'contrasena' => 'sometimes|nullable|string|min:6',
        ];
    }
}
