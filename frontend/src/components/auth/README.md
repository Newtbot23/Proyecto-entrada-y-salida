# Componentes de Recuperación de Contraseña

Este directorio contiene los componentes funcionales de React para el flujo de recuperación de contraseña mediante código de 6 dígitos, conectados con el backend de Laravel.

## Componentes

### 1. ForgotPassword.tsx
Formulario para solicitar un código de recuperación de 6 dígitos.

**Características:**
- Campo de entrada de email con validación HTML5
- Manejo de estados: loading, success, error
- Petición POST a `/api/forgot-password`
- Redirige automáticamente a `/verify-code` después del envío exitoso

### 2. VerifyCode.tsx
Formulario para ingresar y verificar el código de 6 dígitos.

**Características:**
- Captura automática del `email` desde los parámetros de URL
- Campo numérico limitado a 6 dígitos
- Validación automática en el cliente (solo números)
- Petición POST a `/api/verify-code`
- Redirige a `/reset-password` después de verificación exitosa

### 3. ResetPassword.tsx
Formulario para establecer una nueva contraseña.

**Características:**
- Captura automática de `code` y `email` desde parámetros de URL
- Campos para nueva contraseña y confirmación
- Validación de coincidencia de contraseñas (cliente)
- Manejo de errores de validación de Laravel
- Petición POST a `/api/reset-password`
- Redirección automática a `/login` después del éxito

## Integración con React Router

Las rutas ya están configuradas en `App.tsx`:

```tsx
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/verify-code" element={<VerifyCode />} />
<Route path="/reset-password" element={<ResetPassword />} />
```

## Flujo de Usuario (3 Pasos)

### Paso 1: Solicitar Código
- Usuario navega a `/forgot-password`
- Ingresa su email
- El backend genera un código de 6 dígitos
- El código se guarda en la tabla `password_reset_codes`
- Se envía por correo usando `RecoveryCodeMail`
- Redirige automáticamente a `/verify-code?email=usuario@ejemplo.com`

### Paso 2: Verificar Código
- Usuario ingresa el código de 6 dígitos que recibió por email
- El código tiene 60 minutos de validez
- Si es correcto, redirige a `/reset-password?email=usuario@ejemplo.com&code=123456`

### Paso 3: Restablecer Contraseña
- Usuario ingresa nueva contraseña y confirmación
- El backend valida el código nuevamente
- Se actualiza la contraseña hasheada
- Se elimina el código usado de la base de datos
- Redirige a `/login` con mensaje de éxito

## Rutas de API Backend

### POST /api/forgot-password

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "type": "usuario"
}
```

**Response (Éxito - 200):**
```json
{
  "success": true,
  "message": "Se ha enviado un código de recuperación a tu correo electrónico.",
  "data": {
    "email": "usuario@ejemplo.com"
  }
}
```

**Response (Error - 422):**
```json
{
  "success": false,
  "message": "No encontramos un usuario con ese correo electrónico.",
  "errors": {
    "email": ["No encontramos un usuario con ese correo electrónico."]
  }
}
```

### POST /api/verify-code

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456",
  "type": "usuario"
}
```

**Response (Éxito - 200):**
```json
{
  "success": true,
  "message": "Código verificado correctamente.",
  "data": {
    "email": "usuario@ejemplo.com",
    "code": "123456",
    "verified": true
  }
}
```

**Response (Error - 422):**
```json
{
  "success": false,
  "message": "El código es inválido o ha expirado.",
  "errors": {
    "code": ["El código es inválido o ha expirado."]
  }
}
```

### POST /api/reset-password

**Request:**
```json
{
  "email": "usuario@ejemplo.com",
  "code": "123456",
  "password": "nuevaPassword123",
  "password_confirmation": "nuevaPassword123",
  "type": "usuario"
}
```

**Response (Éxito - 200):**
```json
{
  "success": true,
  "message": "Contraseña restablecida con éxito.",
  "data": {
    "email": "usuario@ejemplo.com"
  }
}
```

**Response (Error - 422):**
```json
{
  "success": false,
  "message": "Error de validación.",
  "errors": {
    "password": ["La contraseña debe tener al menos 8 caracteres."],
    "code": ["El código es inválido o ha expirado."]
  }
}
```

## Tipos de Usuario

El sistema soporta dos tipos de usuarios:
- `"usuario"` - Usuarios normales (tabla `usuarios`)
- `"superadmin"` - Super administradores (tabla `admins`)

En los componentes actuales, el tipo está hardcoded como `"usuario"`. Para crear un flujo de super admin, puedes:
1. Duplicar los componentes con sufijo `SuperAdmin`
2. Cambiar el parámetro `type: 'superadmin'` en las peticiones
3. Agregar rutas como `/superadmin/forgot-password`, etc.

## Notas Técnicas

- **Sin estilos:** Los componentes no incluyen ningún tipo de estilos CSS
- **TypeScript:** Todos los componentes usan TypeScript
- **ApiClient:** Utiliza el cliente centralizado de `config/api.ts`
- **Hooks:** `useState`, `useEffect`, `useNavigate`, `useSearchParams`
- **Validaciones:**
  - Cliente: HTML5 (required, type="email", minLength, pattern)
  - Servidor: Laravel validaciones en el controlador
- **Seguridad:** Los códigos expiran en 60 minutos
- **One-time use:** Los códigos se eliminan después de usarse

## Personalización

### Cambiar el tiempo de expiración del código:
En `PasswordRecoveryApiController.php`, cambia `->subMinutes(60)` por el tiempo deseado.

### Cambiar la longitud del código:
En `PasswordRecoveryApiController.php`, línea del `random_int`, cambia `999999` y el `str_pad` length.

### Personalizar el email:
Edita `app/Mail/RecoveryCodeMail.php` y su vista asociada en `resources/views/emails/`.
