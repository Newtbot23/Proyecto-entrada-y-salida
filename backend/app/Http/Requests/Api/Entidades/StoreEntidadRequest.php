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
    protected function prepareForValidation(): void
    {
        if ($this->has('nit')) {
            $nit = $this->input('nit');
            // Remove everything except numbers and hyphen
            $clean = preg_replace('/[^0-9-]/', '', $nit);
            
            if (strpos($clean, '-') === false) {
                // Calculate DV if missing
                $dv = \App\Services\NitService::calculateDV($clean);
                $this->merge(['nit' => "{$clean}-{$dv}"]);
            } else {
                $this->merge(['nit' => $clean]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'nombre_entidad' => [
                'required',
                'string',
                'max:200',
                'unique:entidades,nombre_entidad',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/'
            ],
            'correo' => 'required|email|max:200|unique:entidades,correo',
            'direccion' => [
                'required',
                'string',
                'max:200',
                'regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-\#]+$/'
            ],
            'nombre_titular' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/'
            ],
            'telefono' => [
                'required',
                'string',
                'size:10',
                'unique:entidades,telefono',
                'regex:/^(3[0-9]{9}|60[0-9]{8})$/'
            ],
            'nit' => [
                'required',
                'string',
                'max:15',
                'unique:entidades,nit',
                'regex:/^[0-9\-]+$/'
            ],
            'estado' => 'sometimes|string|in:activo,pendiente,inactivo',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'string' => 'El :attribute debe ser texto.',
            'max' => 'El :attribute no debe exceder de :max caracteres.',
            'size' => 'El :attribute debe tener exactamente :size dígitos.',
            'email' => 'El formato del correo es inválido.',
            'unique' => 'El :attribute ya se encuentra registrado.',
            'nombre_entidad.unique' => 'Este nombre de entidad ya se encuentra registrado.',
            'correo.unique' => 'Este correo ya se encuentra registrado.',
            'nit.unique' => 'Este NIT ya se encuentra registrado.',
            'telefono.unique' => 'Este número de teléfono ya se encuentra registrado.',
            'telefono.size' => 'El teléfono debe tener exactamente 10 dígitos.',
            'telefono.regex' => 'El teléfono debe iniciar con 3 o 60 y contener solo números.',
            'regex' => 'El formato del campo :attribute es inválido.',
            'in' => 'El valor seleccionado para :attribute no es válido.',
        ];
    }
}
