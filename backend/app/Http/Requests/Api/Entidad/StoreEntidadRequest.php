<?php

namespace App\Http\Requests\Api\Entidad;

use Illuminate\Foundation\Http\FormRequest;

use App\Rules\ValidNit;

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
            'nombre_entidad' => 'required|string|min:8|max:200|unique:entidades,nombre_entidad|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'correo' => 'required|email|min:8|max:200|unique:entidades,correo',
            'direccion' => 'required|string|min:8|max:200|regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-\#]+$/',
            'nombre_titular' => 'required|string|min:8|max:100|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono' => ['required', 'string', 'min:8', 'max:15', 'regex:/^(3[0-9]{9}|60[0-9]{8})$/'],
            'nit' => ['required', 'string', 'unique:entidades,nit', new ValidNit],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'string' => 'El :attribute debe ser texto.',
            'max' => 'El :attribute no debe exceder de :max caracteres.',
            'min' => 'El :attribute debe tener al menos :min caracteres.',
            'email' => 'El formato del correo es inválido.',
            'unique' => 'El :attribute ya se encuentra registrado.',
            'regex' => 'El formato del campo :attribute es inválido.',
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre_entidad' => 'nombre de la entidad',
            'correo' => 'correo electrónico',
            'direccion' => 'dirección',
            'nombre_titular' => 'nombre del representante legal',
            'telefono' => 'teléfono',
            'nit' => 'NIT',
        ];
    }

    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $errors = $validator->errors();
        $firstMessage = $errors->first();
        $count = count($errors) - 1;
        $message = $count > 0 
            ? "{$firstMessage} (y {$count} " . ($count === 1 ? 'error más' : 'errores más') . ")" 
            : $firstMessage;

        throw new \Illuminate\Http\Exceptions\HttpResponseException(response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], 422));
    }
}
