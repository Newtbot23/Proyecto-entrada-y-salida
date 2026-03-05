# Contexto Técnico y de Negocio — Formulario de Registro de Entidades

> **Proyecto:** Proyecto-entrada-y-salida  
> **Fecha:** 2026-03-03  
> **Propósito:** Documento consolidado para auditoría de código del módulo de registro de entidades.

---

## 1. Arquitectura General del Flujo

```
Usuario (Navegador)
    │
    ▼
RegisterEntity.tsx          ◄── Formulario React
    │  validateForm()       ◄── Validación frontend (regex)
    │  handleSubmit()       ◄── Envío del formulario
    │
    ▼  POST /api/registration/entidades
registrationService.ts      ◄── Servicio HTTP (fetch)
    │
    ▼
StoreEntidadRequest.php     ◄── FormRequest (validación backend)
    │  rules()              ◄── Reglas de validación + ValidNit
    │  failedValidation()   ◄── Manejo de errores 422
    │
    ▼
EntidadController.php       ◄── Controlador (store)
    │
    ▼
Entidades.php (Modelo)      ◄── setNitAttribute() normaliza NIT
    │
    ▼
Base de Datos MySQL         ◄── Tabla `entidades`
```

**Ruta registrada en** `routes/api.php`:
```php
Route::post('/registration/entidades', [EntidadController::class, 'store']);
```

---

## 2. Código del Frontend

### 2.1 Constantes de Expresiones Regulares (REGEX)

**Archivo:** `frontend/src/pages/user/RegisterEntity.tsx` — Líneas 33-40

```typescript
const REGEX = {
    PHONE: /^(3[0-9]{9}|60[0-9]{8})$/,
    NIT: /^[0-9]{8,15}(-[0-9])?$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    ENTITY_NAME: /^[^0-9]+$/,              // No permite números
    REP_LEGAL_NAME: /^[^0-9]{8,}$/,        // No permite números, mínimo 8 caracteres
    DIRECCION: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-#]+$/,
};
```

| Campo             | Regex                            | Restricción                                                |
|-------------------|----------------------------------|------------------------------------------------------------|
| `telefono`        | `PHONE`                         | 10 dígitos, inicia con `3` o `60` (formato Colombia)       |
| `nit`             | `NIT`                           | 8-15 dígitos, opcionalmente `-` + 1 dígito de verificación |
| `correo`          | `EMAIL`                         | Formato estándar de email                                  |
| `nombre_entidad`  | `ENTITY_NAME`                   | No puede contener dígitos                                  |
| `nombre_titular`  | `REP_LEGAL_NAME`                | No puede contener dígitos, mínimo 8 caracteres             |
| `direccion`       | `DIRECCION`                     | Letras, números, acentos, espacios, comas, puntos, #, -    |

---

### 2.2 Función `validateForm()`

**Archivo:** `frontend/src/pages/user/RegisterEntity.tsx` — Líneas 104-147

```typescript
const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};

    if (!formData.nombre_entidad.trim()) {
        newErrors.nombre_entidad = 'El nombre de la entidad es obligatorio';
    } else if (!REGEX.ENTITY_NAME.test(formData.nombre_entidad)) {
        newErrors.nombre_entidad = 'El nombre de la entidad no puede contener números';
    }

    if (!formData.correo.trim()) {
        newErrors.correo = 'El correo es obligatorio';
    } else if (!REGEX.EMAIL.test(formData.correo)) {
        newErrors.correo = 'Formato de correo inválido';
    }

    if (!formData.direccion.trim()) {
        newErrors.direccion = 'La dirección es obligatoria';
    } else if (!REGEX.DIRECCION.test(formData.direccion)) {
        newErrors.direccion = 'La dirección contiene caracteres no permitidos';
    }

    if (!formData.nombre_titular.trim()) {
        newErrors.nombre_titular = 'El nombre del representante legal es obligatorio';
    } else if (/\d/.test(formData.nombre_titular)) {
        newErrors.nombre_titular = 'El nombre no puede contener números';
    } else if (formData.nombre_titular.trim().length < 8) {
        newErrors.nombre_titular = 'El nombre debe tener al menos 8 caracteres';
    }

    if (!formData.telefono.trim()) {
        newErrors.telefono = 'El teléfono es obligatorio';
    } else if (!REGEX.PHONE.test(formData.telefono)) {
        newErrors.telefono = 'Debe ser un número válido en Colombia (10 dígitos, iniciar en 3 o 60)';
    }

    if (!formData.nit.trim()) {
        newErrors.nit = 'El NIT es obligatorio';
    } else if (!REGEX.NIT.test(formData.nit)) {
        newErrors.nit = 'El NIT debe tener entre 8 y 15 números, y puede incluir un dígito de verificación opcional (Ej: 12345678-9)';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
```

---

### 2.3 Función `handleSubmit()`

**Archivo:** `frontend/src/pages/user/RegisterEntity.tsx` — Líneas 149-191

```typescript
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
        return; // No se envía al backend
    }

    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
        const response = await registrationService.createEntity(formData);

        if (response.success) {
            setSuccess('¡Entidad creada exitosamente! Redirigiendo al registro de administrador...');
            setTimeout(() => {
                navigate('/register-admin', {
                    state: {
                        planId,
                        entidadId: response.data.id || response.data.entidad.nit,
                        entidadNombre: formData.nombre_entidad
                    }
                });
            }, 2000);
        }
    } catch (err: any) {
        console.error('Registration error:', err);
        if (err.status === 422 && err.errors) {
            const mappedErrors: Partial<Record<keyof typeof formData, string>> = {};
            for (const key in err.errors) {
                mappedErrors[key as keyof typeof formData] = err.errors[key][0];
            }
            setFieldErrors(mappedErrors);
            setError('Por favor corrija los errores resaltados.');
        } else {
            setError(err.message || 'Error al crear la entidad. Por favor verifique el formulario.');
        }
    } finally {
        setLoading(false);
    }
};
```

---

### 2.4 Servicio HTTP — `registrationService.createEntity()`

**Archivo:** `frontend/src/services/registrationService.ts` — Líneas 12-29

```typescript
createEntity: async (entityData: any) => {
    try {
        const response = await fetch(`${API_URL}/registration/entidades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(entityData),
        });
        const data = await response.json();
        if (!response.ok) throw data;
        return data;
    } catch (error: any) {
        console.error('Error creating entity:', error);
        throw error;
    }
},
```

---

## 3. Código del Backend (Laravel)

### 3.1 FormRequest — `StoreEntidadRequest`

**Archivo:** `backend/app/Http/Requests/Api/Entidad/StoreEntidadRequest.php`

```php
<?php

namespace App\Http\Requests\Api\Entidad;

use Illuminate\Foundation\Http\FormRequest;
use App\Rules\ValidNit;

class StoreEntidadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre_entidad' => 'required|string|min:8|max:200|unique:entidades,nombre_entidad|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'correo'         => 'required|email|min:8|max:200|unique:entidades,correo',
            'direccion'      => 'required|string|min:8|max:200|regex:/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s,.\-\#]+$/',
            'nombre_titular' => 'required|string|min:8|max:100|regex:/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/',
            'telefono'       => ['required', 'string', 'min:8', 'max:15', 'regex:/^(3[0-9]{9}|60[0-9]{8})$/'],
            'nit'            => ['required', 'string', 'unique:entidades,nit', new ValidNit],
        ];
    }

    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'string'   => 'El :attribute debe ser texto.',
            'max'      => 'El :attribute no debe exceder de :max caracteres.',
            'min'      => 'El :attribute debe tener al menos :min caracteres.',
            'email'    => 'El formato del correo es inválido.',
            'unique'   => 'El :attribute ya se encuentra registrado.',
            'regex'    => 'El formato del campo :attribute es inválido.',
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre_entidad' => 'nombre de la entidad',
            'correo'         => 'correo electrónico',
            'direccion'      => 'dirección',
            'nombre_titular' => 'nombre del representante legal',
            'telefono'       => 'teléfono',
            'nit'            => 'NIT',
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
            'errors'  => $errors
        ], 422));
    }
}
```

**Resumen de reglas de validación del FormRequest:**

| Campo             | Reglas                                                           |
|-------------------|------------------------------------------------------------------|
| `nombre_entidad`  | required, string, min:8, max:200, unique, regex (solo letras)    |
| `correo`          | required, email, min:8, max:200, unique                          |
| `direccion`       | required, string, min:8, max:200, regex (alfanumérico + signos)  |
| `nombre_titular`  | required, string, min:8, max:100, regex (solo letras)            |
| `telefono`        | required, string, min:8, max:15, regex (formato Colombia)        |
| `nit`             | required, string, unique, **ValidNit** (regla personalizada)     |

---

### 3.2 Controlador — `EntidadController::store()`

**Archivo:** `backend/app/Http/Controllers/Api/EntidadController.php` — Líneas 21-71

```php
public function store(StoreEntidadRequest $request): JsonResponse
{
    // La validación es manejada automáticamente por StoreEntidadRequest.
    // Si falla, se ejecuta failedValidation() y se retorna HTTP 422.

    try {
        $entidad = Entidades::create([
            'nombre_entidad' => $request->nombre_entidad,
            'correo'         => $request->correo,
            'direccion'      => $request->direccion,
            'nombre_titular' => $request->nombre_titular,
            'telefono'       => $request->telefono,
            'nit'            => $request->nit,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Entity created successfully',
            'data'    => [
                'entidad' => $entidad,
                'id'      => $entidad->nit
            ]
        ], 201);

    } catch (\Illuminate\Database\QueryException $e) {
        if ($e->errorInfo[1] == 1062) {
            // Error de duplicado en BD (unique constraint violation)
            return response()->json([
                'success' => false,
                'message' => 'El NIT, correo o nombre de la entidad ya se encuentran en uso.',
                'errors'  => [
                    'duplicado' => ['Uno de los datos únicos introducidos ya está registrado.']
                ]
            ], 422);
        }

        return response()->json([
            'success' => false,
            'message' => 'Error en la base de datos',
            'errors'  => ['server' => [$e->getMessage()]]
        ], 500);

    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error al crear la entidad',
            'errors'  => ['server' => [$e->getMessage()]]
        ], 500);
    }
}
```

---

### 3.3 Regla Personalizada — `ValidNit`

**Archivo:** `backend/app/Rules/ValidNit.php`

```php
<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Services\NitService;

class ValidNit implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // 1. Verificar que sea string
        if (!is_string($value)) {
            $fail('El :attribute debe ser una cadena de texto.');
            return;
        }

        // 2. Verificar formato con regex (solo números y guiones, 8-17 caracteres)
        if (!preg_match('/^[0-9-]{8,17}$/', $value)) {
            $fail('El formato del :attribute es inválido. Solo se permiten números y guiones.');
            return;
        }

        // 3. Validar el dígito de verificación mediante NitService
        if (!NitService::validateNit($value)) {
            $data = NitService::normalizeNit($value);
            $expectedDv = NitService::calculateDV($data['base']);
            $fail("El dígito de verificación es inválido. Para el NIT {$data['base']} el dígito calculado es $expectedDv.");
        }
    }
}
```

---

## 4. Lógica de Negocio — `NitService`

**Archivo:** `backend/app/Services/NitService.php`

### 4.1 Código Completo

```php
<?php

namespace App\Services;

class NitService
{
    /**
     * Calcula el dígito de verificación (DV) de un NIT usando el algoritmo de la DIAN.
     * Pesos: [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71]
     * Se recorren los dígitos de derecha a izquierda, multiplicando por el peso correspondiente.
     */
    public static function calculateDV(string $nitBase): int
    {
        $arr = array_map('intval', str_split($nitBase));
        $len = count($arr);
        $weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];

        $sum = 0;
        $j = 0;

        for ($i = $len - 1; $i >= 0; $i--) {
            $sum += $arr[$i] * $weights[$j];
            $j++;
        }

        $mod = $sum % 11;

        if ($mod > 1) {
            return 11 - $mod;
        }

        return $mod; // Si mod es 0 o 1, el DV es 0 o 1 respectivamente
    }

    /**
     * Normaliza el NIT separando la base numérica del dígito de verificación.
     * Entrada: "90012345-6" → Salida: ['base' => '90012345', 'dv' => 6]
     * Entrada: "90012345"   → Salida: ['base' => '90012345', 'dv' => null]
     */
    public static function normalizeNit(string $input): array
    {
        $input = preg_replace('/[^0-9-]/', '', $input);

        if (strpos($input, '-') !== false) {
            $parts = explode('-', $input);
            $base = $parts[0];
            $dv = isset($parts[1]) && $parts[1] !== '' ? (int)$parts[1] : null;
            return ['base' => $base, 'dv' => $dv];
        }

        return ['base' => $input, 'dv' => null];
    }

    /**
     * Valida un NIT completo:
     * 1. Normaliza la entrada (separa base y DV).
     * 2. Verifica que la base tenga entre 8 y 15 dígitos.
     * 3. Si se proporcionó DV, lo compara con el DV calculado.
     * 4. Si no se proporcionó DV, el NIT es válido solo con la base.
     */
    public static function validateNit(string $input): bool
    {
        $data = self::normalizeNit($input);
        $base = $data['base'];
        $dv = $data['dv'];

        if (strlen($base) < 8 || strlen($base) > 15) {
            return false;
        }

        if ($dv !== null) {
            $calculatedDv = self::calculateDV($base);
            return $dv === $calculatedDv;
        }

        return true;
    }
}
```

### 4.2 Explicación del Algoritmo DIAN para DV

El **dígito de verificación (DV)** del NIT colombiano se calcula así:

1. Se toma la parte numérica base del NIT (sin el DV).
2. Se recorren los dígitos **de derecha a izquierda**.
3. Cada dígito se multiplica por un peso de la secuencia: `3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71`.
4. Se suman todos los productos.
5. Se calcula `mod = suma % 11`.
6. Si `mod > 1` → DV = `11 - mod`. Si `mod ≤ 1` → DV = `mod`.

**Ejemplo:** NIT base `90012345`  
→ Se multiplica cada dígito por su peso, se suma, se aplica módulo 11, y se obtiene el DV esperado.

---

## 5. Base de Datos / Modelo

### 5.1 Migración — Tabla `entidades`

**Archivo:** `backend/database/migrations/2026_02_05_022957_create_entidades_table.php`

```php
Schema::create('entidades', function (Blueprint $table) {
    $table->string('nit', 15)->primary();       // ◄── PK, índice único implícito
    $table->string('nombre_entidad', 200);
    $table->string('correo', 200);
    $table->string('direccion', 200);
    $table->string('nombre_titular', 100);
    $table->string('telefono', 15);
    $table->enum('estado', ['activo','inactivo'])->default('activo');
    $table->timestamps();
});
```

### 5.2 Restricciones de Unicidad en BD

| Columna           | Restricción              | Origen                                      |
|-------------------|--------------------------|----------------------------------------------|
| `nit`             | **PRIMARY KEY** (único)  | Migración: `->primary()`                     |
| `nombre_entidad`  | Único a nivel de **validación** | FormRequest: `unique:entidades,nombre_entidad` |
| `correo`          | Único a nivel de **validación** | FormRequest: `unique:entidades,correo`       |

> **Nota:** `nombre_entidad` y `correo` **no tienen índice UNIQUE en la base de datos** (no se definen en la migración). La unicidad se garantiza solo mediante las reglas de validación de Laravel. Si se insertara un duplicado saltando la validación, la BD no lo impediría. Solo `nit` tiene restricción única a nivel de base de datos por ser la clave primaria.

---

### 5.3 Modelo Eloquent — `Entidades`

**Archivo:** `backend/app/Models/Entidades.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Entidades extends Model
{
    protected $table = 'entidades';
    protected $primaryKey = 'nit';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'nombre_entidad', 'correo', 'direccion',
        'nombre_titular', 'telefono', 'nit', 'estado'
    ];

    // --- Relaciones ---
    public function usuarios()
    {
        return $this->hasMany(Usuarios::class, 'nit_entidad', 'nit');
    }

    public function licencia()
    {
        return $this->hasOne(LicenciasSistema::class, 'nit_entidad', 'nit');
    }

    // --- Eventos del modelo ---
    protected static function boot()
    {
        parent::boot();

        // Al eliminar una entidad, se eliminan también su licencia y usuarios
        static::deleting(function ($entidad) {
            if ($entidad->licencia) {
                $entidad->licencia->delete();
            }
            if ($entidad->usuarios) {
                foreach ($entidad->usuarios as $usuario) {
                    $usuario->delete();
                }
            }
        });
    }

    /**
     * Mutator: normaliza el NIT antes de guardarlo.
     * - Limpia caracteres no válidos.
     * - Si no se proporcionó DV, lo calcula automáticamente.
     * - Almacena en formato "base-DV" (ej: "90012345-6").
     */
    public function setNitAttribute($value)
    {
        $cleanValue = preg_replace('/[^0-9-]/', '', $value);

        $parts = explode('-', $cleanValue);
        $base = $parts[0];
        $dv = isset($parts[1]) && $parts[1] !== '' ? (int)$parts[1] : null;

        if ($dv === null) {
            $dv = \App\Services\NitService::calculateDV($base);
        }

        $this->attributes['nit'] = "{$base}-{$dv}";
    }
}
```

---

## 6. Resumen de Capas de Validación

El formulario de registro de entidad aplica **3 capas de validación**:

```
┌─────────────────────────────────────────────────────────┐
│  CAPA 1: Frontend (validateForm)                        │
│  - Campos obligatorios (vacío)                          │
│  - Regex por campo (formato)                            │
│  - Retroalimentación inmediata al usuario               │
├─────────────────────────────────────────────────────────┤
│  CAPA 2: Backend - FormRequest (StoreEntidadRequest)    │
│  - required, string, min, max, email, regex             │
│  - unique (nombre_entidad, correo, nit)                 │
│  - ValidNit (dígito de verificación DIAN)               │
│  - Respuesta 422 con errores mapeados                   │
├─────────────────────────────────────────────────────────┤
│  CAPA 3: Base de Datos (MySQL)                          │
│  - PRIMARY KEY en `nit` (unicidad a nivel BD)           │
│  - Restricciones de tipo y longitud de columnas         │
│  - QueryException 1062 capturada en el controlador      │
└─────────────────────────────────────────────────────────┘
```
