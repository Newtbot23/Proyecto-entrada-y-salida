# Reglas de Arquitectura y Código (Proyecto Entrada y Salida)

Actúa siempre como un Arquitecto de Software Full Stack Senior. 

## 0. REGLA DE ORO (RESPETO AL CÓDIGO EXISTENTE)
- **Prohibido Renombrar Modelos Existentes:** Si un modelo ya existe en plural (ej. `Programas`, `Fichas`, `Vehiculos`, `Equipos`), **NO LO RENOMBRES** a singular bajo ninguna circunstancia. Hacerlo romperá las relaciones y el sistema. Aplica convenciones estrictas de nombres SOLO a los archivos completamente nuevos que vayas a crear.

## 1. FRONTEND (React + TypeScript + Vite)
- **CERO Estilos en Línea:** Está ESTRICTAMENTE PROHIBIDO usar la etiqueta `style={{...}}`. Toda estilización debe hacerse mediante CSS Modules (`Archivo.module.css`).
- **Manejo de Estado del Servidor:** Prohibido usar `useEffect` + `fetch` + `useState`. DEBES usar exclusivamente **TanStack Query v5** (`useQuery`, `useMutation`).
- **Tipado Estricto:** Usa siempre interfaces de TypeScript actualizadas. Revisa la carpeta `services/` para la estructura real.
- **Cliente API:** Todas las peticiones HTTP deben pasar por el cliente centralizado (`apiClient`). Cero `fetch()` crudos.

## 2. BACKEND (Laravel 11+)
- **Consultas a Base de Datos (¡CRÍTICO!):** NUNCA asumas relaciones directas. ANTES de escribir SQL o Eloquent, revisa las migraciones y modelos. Identifica correctamente las tablas pivote (ej. `asignaciones`).
- **Rendimiento (Cero N+1):** Prohibido hacer consultas en bucles. Usa SIEMPRE Eager Loading (`with()`) y agregaciones SQL (`withCount()`).
- **Respuestas Uniformes:** Devuelve siempre `{'success': boolean, 'data': mixed, 'message': string}`.

## 3. FLUJO DE TRABAJO
- **Prevención de Daños:** Adapta tu lógica nueva a la estructura existente, no intentes reescribir el core del sistema a menos que el usuario lo pida explícitamente. Verifica siempre que tus importaciones no rompan la app.

## 4. TESTEOS
- **Credenciales de ingreso:** ya que estas realizando testeos abriendo el proyecto en el navegador, ten en cuenta que existen dos login con urls diferentes para cada ingreso con intencion de realizar pruebas en el modulo de superadmin utiliza este url (`http://localhost:5173/superadmin/login`) con credenciales de superadmin 
**Usuario:** (`cortazarrodriguezjuliocesar@gmail.com`)
**contraseña:**(`Julio_12345`)

- para el ingreso de admin normal asociado a una empresa utiliza siempre la url: (`http://localhost:5173/login`) con credenciales para admin normal asociado a una empresa
**Usuario:** (`cortazarrodriguezjuliocesar@gmail.com`)
**contraseña:**(`Julio_12345`)

- para realizar funciones como usuario normal utiliza siempre la url: (`http://localhost:5173/login`) con credenciales para usuario normal
**Usuario:** (`cortazarrodriguezjuliocesar4@gmail.com`)
**contraseña:**(`Julio_12345`)

utiliza siempre estas credenciales para realizar pruebas en el proyecto nunca intentes recuperar contraseña si las credenciales no permiten el acceso deten tu ejecución y verifica que estas utilizando las credenciales correctas si aun asi no funcionan detén tu ejecución y notifica al usuario el problema y continua tus testeos con la respuesta que te de el usuario.