# Bitácora de Pruebas de Calidad de Software

## 1. Información General del Proyecto
**Nombre del Proyecto:** Sistema de Control de entrada y salida junto a la asignación de equipos
**Módulo/Componente:** Gestión de licencias, control de puertas, asignaciones de activos (Vehículos/Equipos)
**Responsable del Test:** Equipo de Testing / QA
**Fecha de Ejecución:** 12/03/2026
**Entorno de Pruebas:** Ambiente de desarrollo/integraciones con PHP (Laravel) y SQL, Frontend React/TypeScript

---

## 2. Detalle de Pruebas de Caja Negra (Funcionales)
*Enfoque: Requerimientos, entradas y salidas desde la perspectiva del usuario (frontend e interacción de la interfaz), sin ver el código interno.*

| ID Caso | Requisito Relacionado | Descripción de la Prueba | Datos de Entrada | Resultado Esperado | Resultado Obtenido | Estado (Pasa/Falla) |
|---------|-----------------------|--------------------------|------------------|--------------------|--------------------|--------------------|
| **CN-01** | RQ-Aprob-01 (Aprobación Activos) | Validar la aprobación de un vehículo/equipo pendiente. | Seleccionar estado `activo` para el registro `XYZ-123` en el panel de administrador. | Vehículo pasa a estado `activo` y se retira de la tabla de pendientes en tiempo real. | El activo es removido del dashboard y confirmado `activo`. | **Pasa** |
| **CN-02** | RQ-Form-03 (Validación en tiempo real) | Probar que la placa ingresada cumple con el formato válido. | Ingresar en el input: texto `@#$%^&*()` | Error en el frontend: "El formato no coincide con el especificado". | Error debajo del input visible inmediatamente. | **Pasa** |
| **CN-03** | RQ-OCR-02 (Lectura de placas) | Validar lectura cruzada de placa OCR frente a input manual. | Placa manual: `ABC-123`. OCR detecta: `XYZ-999`. | Alerta del sistema indicando que las placas no coinciden, previniendo el registro. | Alerta mostrada y registro bloqueado sin confirmación. | **Pasa** |
| **CN-04** | RQ-Salida-01 (Control de Puertas) | Validar selección de equipo a la salida de la instalación. | Intentar sacar un vehículo que no se seleccionó al entrar (el empleado entró otro vehículo distinto). | El sistema bloquea o filtra la opción para solo mostrar el vehículo actualmente dentro. | Opciones mal filtradas, permite elegir vehículos no ingresados. | **Falla** |

**Técnicas sugeridas utilizadas:** Partición de equivalencia, análisis de valores límite, pruebas de transición de estado.

---

## 3. Detalle de Pruebas de Caja Blanca (Estructurales)
*Enfoque: Cobertura de código, flujos lógicos, ramas (condicionales) y manejo de excepciones en el backend (Controladores de Laravel).*

| ID Caso | Método/Función | Tipo de Cobertura | Flujo Lógico / Camino | Resultado Técnico Esperado | Resultado Real | Estado |
|---------|----------------|-------------------|-----------------------|----------------------------|----------------|--------|
| **CB-01** | `AprobacionesActivosController::updateEstado()` | Cobertura de Ramas | Enviar parámetro `$tipo = 'desconocido'` (ni vehículo ni equipo) en la URL. | Retorno HTTP `400` con `['success' => false, 'message' => 'Tipo de activo inválido.']`. | Respuesta JSON 400 obtenida correctamente. | **Pasa** |
| **CB-02** | `AprobacionesActivosController::updateEstado()` | Cobertura de Camino | Probar flujo de actualización donde el `$id` (placa/serial) no existe en BD. | Retorno HTTP `404` con mensaje `"Vehículo no encontrado"` o equivalente. | Error 404 capturado, JSON devuelto con mensaje esperado. | **Pasa** |
| **CB-03** | `AprobacionesActivosController::updateEstado()` | Cobertura de Sentencias | Enviar `$request` con `estado_aprobacion` fuera de enumeración (ej. `suspendido`). | El validador inicial falla. HTTP `422 Unprocessable Entity` retornando errores. | Validación previene consulta a DB, código 422 obtenido. | **Pasa** |
| **CB-04** | `DynamicTableController::index()` | Cobertura de Bucles / Consultas | Pasar filtro de búsqueda complejo que retorne exactamente cero (0) filas de la BD. | Finalización de ciclo de filtrado exitoso, retorno JSON con array vacío `[]`. | Consulta procesa sin lanzar Excepciones PDO, array `[]`. | **Pasa** |

**Técnicas sugeridas utilizadas:** Branch Coverage (Cobertura de ramas `if/else`), Basis Path Testing (Prueba de ruta básica), Manejo de validaciones.

---

## 4. Registro de Incidencias (Bugs)
*Registro extraído de sesiones operativas de las pruebas implementadas.*

* **ID Incidencia:** `BUG-001`
  * **Gravedad:** ALTA
  * **Descripción del error:** Error HTTP 500 `Internal Server Error` en vistas "Puerta Vehiculos" y "Puerta Personas" al momento de interceptar la búsqueda para el ingreso. 
  * **Pasos para reproducir:** 
    1. Ir al panel principal e ingresar en "Puerta Vehículos". 
    2. Ingresar un parámetro válido en el buscador y pulsar "Buscar". 
    3. El sistema se congela y por consola/devtools expone error 500 originado en el Laravel.log.

* **ID Incidencia:** `BUG-002`
  * **Gravedad:** MEDIA
  * **Descripción del error:** Falta de selección filtrada a la hora de realizar la salida. Un usuario que ingresa con vehículo A, al tratar de registrar su salida, puede ver u optar por el vehículo B en caso de tener más asignaciones.
  * **Pasos para reproducir:** 
    1. Ingresar empleado con vehículo "Vehículo A" (Placa: AAA-111).
    2. Modificar en formulario de salida y seleccionar "Vehículo B" (Placa: BBB-222) de la lista desplegable de activos de la persona.
    3. El sistema aprueba erróneamente el registro finalizando la operación.

* **ID Incidencia:** `BUG-003`
  * **Gravedad:** BAJA
  * **Descripción del error:** En la integración de OCR, si el campo placa principal queda vacío y la imagen es procesada con éxito, el input no se rellena ("autocomplete") con la lectura obtenida.
  * **Pasos para reproducir:** 
    1. No introducir dato manual en input Placa.
    2. Subir imagen clara con placa.
    3. Finalizar procesado. El texto queda limpio sin ser rellenado automáticamente.

---

## 5. Resumen y Cierre

**Total Pruebas Ejecutadas:** 8 (4 Caja Negra | 4 Caja Blanca)
**Exitosas:** 7 | **Fallidas:** 1
**Observaciones Adicionales:** 
El ciclo de pruebas muestra gran madurez en el control de endpoints de Laravel, validando parámetros sin afectar estabilidad. Por la parte de frontend y lógica de negocio, se requiere un refactor en las lógicas de registro de Salida que involucra equipos/vehículos que garanticen coherencia de estado (si entró A debe salir A, no B). Se sugiere además estabilizar el endpoint que ocasiona las excepciones 500 para evitar bloqueos del guardia o del operador en la Puerta.

---

### Principales diferencias plasmadas en la prueba:
* **Caja Negra:** Se verificó exclusivamente contra el comportamiento de la página (ej. alertas de OCR, límites de formulario de frontend o aprobación de listados), probando la especificación y lo que ve el usuario (Admin o Guardia).
* **Caja Blanca:** Se crearon las pruebas mirando las ramificaciones directas de Controladores en PHP (ej. `AprobacionesActivosController`), validando las respuestas exactas (status `400`, `404`, `422`) según las validaciones del código fuente para asegurar que no ocurran `Unhandled Exceptions`.
