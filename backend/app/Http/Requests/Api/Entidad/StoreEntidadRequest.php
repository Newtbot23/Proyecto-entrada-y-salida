<?php

namespace App\Http\Requests\Api\Entidad;

use Illuminate\Foundation\Http\FormRequest;

class StoreEntidadRequest extends FormRequest
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
            'nombre_entidad' => 'required|string|min:8|max:200|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'correo' => 'required|email|min:8|max:200|unique:entidades,correo',
            'direccion' => 'required|string|min:8|max:200|regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.-]+$/',
            'nombre_titular' => 'required|string|min:8|max:100|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono' => 'required|string|min:8|max:15|regex:/^[0-9+\-\s()]+$/',
            'nit' => 'required|string|min:6|max:15|unique:entidades,nit|regex:/^[0-9\-]+$/',
        ];
    }
}
