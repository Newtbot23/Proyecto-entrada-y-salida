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
            'doc' => ['required', 'string', 'regex:/^[0-9]{7,10}$/', 'unique:usuarios,doc'],
            'id_tip_doc' => 'required|exists:tipo_doc,id_tip_doc',
            'primer_nombre' => 'required|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/',
            'primer_apellido' => 'required|string|max:50|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/',
            'user_telefono' => ['required', 'string', 'regex:/^(3[0-9]{9}|60[0-9]{8})$/'],
            'user_correo' => 'required|email|max:100|unique:usuarios,correo',
            'contrasena' => ['required', 'string', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/'],
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
            'exists' => 'El valor seleccionado para :attribute no existe.',
            'regex' => 'El formato del campo :attribute es inválido.',
        ];
    }

    public function attributes(): array
    {
        return [
            'doc' => 'número de documento',
            'user_telefono' => 'teléfono',
            'user_correo' => 'correo electrónico',
            'contrasena' => 'contraseña',
            'primer_nombre' => 'primer nombre',
            'primer_apellido' => 'primer apellido',
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
