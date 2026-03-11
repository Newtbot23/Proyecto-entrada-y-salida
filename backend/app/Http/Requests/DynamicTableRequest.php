<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class DynamicTableRequest extends FormRequest
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
        $table = $this->route('table'); // from dynamic route {table}
        
        $dynamicRules = [
            'jornadas' => [
                'jornada' => ['required', 'string', 'min:5', 'max:20', 'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{5,20}$/']
            ],
            'marcas_equipo' => [
                'marca' => ['required', 'string', 'min:2', 'max:20', 'regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-&]{2,20}$/']
            ],
            'naves' => [
                'nave' => ['required', 'string', 'min:1', 'max:50', 'regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]{1,50}$/']
            ],
            'programas' => [
                'programa' => ['required', 'string', 'min:5', 'max:150', 'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\(\)\-]{5,150}$/']
            ],
            'roles' => [
                'rol' => ['required', 'string', 'min:3', 'max:20', 'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]{3,20}$/']
            ],
            'sistemas_operativos' => [
                'sistema_operativo' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\.]{3,50}$/']
            ],
            'tipos_documento' => [
                'nombre' => ['required', 'string', 'min:2', 'max:30', 'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\.]{2,30}$/']
            ],
            'tipos_vehiculo' => [
                'tipo_vehiculo' => ['required', 'string', 'min:3', 'max:50', 'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{3,50}$/']
            ],
        ];

        return $dynamicRules[$table] ?? [];
    }

    /**
     * Custom messages for validation errors.
     */
    public function messages(): array
    {
        return [
            'regex' => 'El formato del campo :attribute es inválido.',
            'min' => 'El campo :attribute debe tener al menos :min caracteres.',
            'max' => 'El campo :attribute no debe exceder :max caracteres.',
            'required' => 'El campo :attribute es obligatorio.',
            'string' => 'El campo :attribute debe ser texto.'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Errores de validación',
            'errors' => $validator->errors()
        ], 422));
    }
}
