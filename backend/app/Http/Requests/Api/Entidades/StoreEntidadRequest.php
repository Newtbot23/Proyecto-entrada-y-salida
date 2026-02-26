<?php

namespace App\Http\Requests\Api\Entidades;

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
            'nombre_entidad' => 'required|string|max:200|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'correo' => 'required|email|max:200|unique:entidades,correo',
            'direccion' => 'required|string|max:200|regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-\#]+$/',
            'nombre_titular' => 'required|string|max:100|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono' => 'required|string|max:15|regex:/^[0-9+\-\s()]+$/',
            'nit' => 'required|string|max:15|unique:entidades,nit|regex:/^[0-9\-]+$/',
            'estado' => 'sometimes|string|in:activo,pendiente,inactivo',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'string' => 'El :attribute debe ser texto.',
            'max' => 'El :attribute no debe exceder de :max caracteres.',
            'email' => 'El formato del correo es inválido.',
            'unique' => 'El :attribute ya se encuentra registrado.',
            'regex' => 'El formato del campo :attribute es inválido.',
            'in' => 'El valor seleccionado para :attribute no es válido.',
        ];
    }
}
