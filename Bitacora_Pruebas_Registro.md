# Bitácora de Pruebas de Calidad de Software

## 1. Información General del Proyecto
**Nombre del Proyecto:** Sistema de Control de entrada y salida junto a la asignación de equipos
**Módulo/Componente:** Registro de Usuarios con Validación Facial y Generación de Código de Barras
**Responsable del Test:** Dilan Santiago Ortiz Mendoza
**Fecha de Ejecución:** [12/03/2026]
**Entorno de Pruebas:** Desarrollo (Laravel 10 / PHP 8.x / React + Vite / Google Vision API)

## 2. Detalle de Pruebas de Caja Negra (Funcionales)
**Enfoque:** Validación de requerimientos y experiencia de usuario en el flujo de registro por invitación.

| ID Caso | Requisito Relacionado | Descripción de la Prueba | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado (Pasa/Falla) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CN-Reg-01 | RQ-Facial-01 | Validar registro exitoso con rostro humano claro. | Imagen: `face_photo.jpg` | Registro exitoso y redirección al login. | Usuario registrado y archivos guardados. | Pasa |
| CN-Reg-02 | RQ-Facial-02 | Validar bloqueo de registro con imagen sin rostro (objeto). | Imagen: `paisaje.png` | Alerta de error: "La imagen no parece contener un rostro..." | Alerta mostrada y registro bloqueado correctamente. | Pasa |
| CN-Reg-03 | RQ-Barcode-01 | Validar visualización de código de barras en Mi Dashboard. | Usuario autenticado | Visualización del código SVG y opción de impresión. | Mensaje: "Aún no tienes un código de barras asignado." | **Falla** |

## 3. Detalle de Pruebas de Caja Blanca (Estructurales)
**Enfoque:** Integridad del flujo lógico en el backend (`UsuariosController`) y servicios de comunicación.

| ID Caso | Método/Función | Tipo de Cobertura | Flujo Lógico / Camino | Resultado Técnico Esperado | Resultado Real | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| CB-Reg-01 | `registerWithQr` | Manejo de Excepciones | Error en el servicio Google Vision API (403/500). | El controlador captura la excepción y retorna un error JSON elegante. | Atrapado por el catch general con mensaje de error. | Pasa |
| CB-Reg-02 | `registerWithQr` | Cobertura de Caminos | Generación de Barcode SVG sin dependencias GD/Imagick. | Creación exitosa del archivo `.svg` en `storage/app/public/usuarios/barcodes`. | SVG generado correctamente mediante XML plano. | Pasa |
| CB-Reg-03 | `login` | Propagación de Datos | Inclusión del campo `codigo_qr` en el JSON de respuesta. | El objeto `user` en la respuesta JSON debe contener la clave con la ruta del archivo. | La clave se omite o el mapeo en el frontend es incorrecto. | **Falla** |

## 4. Registro de Incidencias (Bugs)
| ID Incidencia | Gravedad | Descripción del error | Pasos para reproducir |
| :--- | :--- | :--- | :--- |
| **BUG-004** | Alta | El campo `codigo_qr` no se propaga al Dashboard del usuario tras el login. | 1. Registrar usuario. 2. Iniciar sesión. 3. Ir a "Mi Código". |
| **BUG-005** | Media | Desajuste de nombres de campos entre Backend (`id`) y Frontend (`doc`). | 1. Inspeccionar JSON de login. El campo del documento viene como `id` en lugar de `doc`, rompiendo el tipado de TypeScript. |

## 5. Resumen y Cierre
**Total Pruebas Ejecutadas:** 6
**Exitosas:** 4 | **Fallidas:** 2

**Observaciones:**
Aunque el motor de detección facial y el generador de códigos de barras (SVG) funcionan a la perfección, existe un problema de "tubería" de datos entre el login y el dashboard. El frontend no está recibiendo o no está guardando la propiedad `codigo_qr` en el estado global. Se recomienda ajustar el `NormalAdminAuthController` para estandarizar los nombres de los campos con los que espera el `AuthContext`. Asimismo, es prioritario estabilizar los endpoints de búsqueda para eliminar los errores 500 (BUG-001) que bloquean la operación en portería.

---

### Diferencias Clave para la Documentación
| Tipo de Prueba | Enfoque Principal | Ideal para... |
| :--- | :--- | :--- |
| **Caja Negra** | Se basa en la especificación y el comportamiento externo. "Hacer lo que debe hacer". | Validación con el usuario final, pruebas de aceptación y flujos de interfaz. |
| **Caja Blanca** | Se basa en el diseño detallado y el código interno. "Cómo está programado". | Desarrolladores, asegurar eficiencia, manejo de excepciones y evitar código muerto. |
