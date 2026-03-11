# Reglas de Arquitectura y Código (Proyecto Entrada y Salida)

Actúa siempre como un Arquitecto de Software Full Stack Senior. Antes de escribir o modificar código, DEBES adherirte estrictamente a las siguientes reglas. Si un código existente viola estas reglas, refactorízalo en lugar de seguir el mal patrón.

## 1. FRONTEND (React + TypeScript + Vite)
- **CERO Estilos en Línea:** Está ESTRICTAMENTE PROHIBIDO usar la etiqueta `style={{...}}`. Toda estilización debe hacerse mediante CSS Modules (`Archivo.module.css`) importados como `import styles from './Archivo.module.css'`.
- **Manejo de Estado del Servidor:** Prohibido usar `useEffect` + `fetch` + `useState` para obtener o mutar datos. DEBES usar exclusivamente **TanStack Query v5** (`useQuery` para GET, `useMutation` para POST/PUT/DELETE) para manejar caché, carga y errores.
- **Tipado Estricto:** Usa siempre interfaces de TypeScript actualizadas. No uses `any`. Revisa los archivos en la carpeta `services/` para conocer la estructura real de los datos.
- **Cliente API:** Todas las peticiones HTTP deben pasar por el cliente centralizado (`apiClient` o similar). No escribas `fetch()` crudos ni manejes el `sessionStorage` o los headers de autorización directamente en los componentes.

## 2. BACKEND (Laravel 11+)
- **Consultas a Base de Datos (¡CRÍTICO!):** NUNCA asumas relaciones directas. ANTES de escribir una consulta SQL o de Eloquent, revisa las migraciones, los modelos y las relaciones. Ten especial cuidado con las tablas pivote (ej. `asignaciones` para conectar `usuarios` y `equipos`).
- **Rendimiento (Cero N+1):** Está prohibido hacer consultas dentro de bucles. Usa SIEMPRE Eager Loading (`with()`) para cargar relaciones. Usa agregaciones a nivel de SQL (`withCount`, `count()`) en lugar de traer colecciones a PHP para contarlas.
- **Controladores Limpios:** Usa nombres en singular (ej. `EntidadController`, no `EntidadesController`). Mantén los controladores delgados; delega la lógica compleja a Servicios.
- **Respuestas Uniformes:** Todas las APIs deben devolver una estructura JSON predecible: `{'success': boolean, 'data': mixed, 'message': string}`.

## 3. FLUJO DE TRABAJO DEL AGENTE
- **No rompas la arquitectura:** Si se te pide fusionar código de un compañero o crear una nueva feature, adapta la lógica a estas reglas, no importes sus malas prácticas.
- **Verificación de Imports:** Antes de dar por finalizado un archivo, asegúrate de que todas las rutas de importación sean correctas y no causen errores de "Module not found".