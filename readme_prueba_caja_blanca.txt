================================================================================
  PRUEBA DE CAJA BLANCA - CAMINOS BÁSICOS (MODELO DE NODOS)
  FORMULARIO: REGISTRAR ENTIDAD
================================================================================

ARCHIVOS ANALIZADOS:
  - Frontend: frontend/src/pages/user/RegisterEntity.tsx
  - Servicio: frontend/src/services/registrationService.ts
  - FormRequest: backend/app/Http/Requests/Api/Entidad/StoreEntidadRequest.php
  - Controlador: backend/app/Http/Controllers/Api/EntidadController.php
  - Regla NIT: backend/app/Rules/ValidNit.php
  - Servicio NIT: backend/app/Services/NitService.php
  - Modelo: backend/app/Models/Entidades.php

================================================================================
1. GRAFO DE FLUJO DE CONTROL - FUNCIÓN handleSubmit (Frontend)
   Archivo: RegisterEntity.tsx, líneas 149-191
================================================================================

CÓDIGO FUENTE SIMPLIFICADO:
----------------------------------------------------------------------
  const handleSubmit = async (e) => {
N1:   e.preventDefault();
N2:   if (!validateForm()) {            // Decisión: ¿Validación frontend OK?
N3:       return;                        // Fin - validación falló
      }
N4:   setLoading(true);
      setError(null);
      setFieldErrors({});
N5:   try {
N6:       const response = await registrationService.createEntity(formData);
N7:       if (response.success) {        // Decisión: ¿Respuesta exitosa?
N8:           setSuccess('¡Entidad creada exitosamente!...');
            setTimeout(() => navigate(...), 2000);
          }
N9:   } catch (err) {
N10:      if (err.status === 422 && err.errors) {   // Decisión: ¿Error 422?
N11:          // Mapear errores del backend a campos
              setFieldErrors(mappedErrors);
              setError('Por favor corrija los errores...');
          } else {
N12:          setError(err.message || 'Error al crear la entidad...');
          }
N13:  } finally {
N14:      setLoading(false);             // Fin
      }
  };
----------------------------------------------------------------------

IDENTIFICACIÓN DE NODOS:
+------+---------------------------------------------------------------+-----------+
| NODO | DESCRIPCIÓN                                                   | TIPO      |
+------+---------------------------------------------------------------+-----------+
| N1   | Inicio: e.preventDefault()                                    | Proceso   |
| N2   | Decisión: ¿validateForm() retorna true?                       | Decisión  |
| N3   | return (validación falló, no se envía formulario)             | Fin       |
| N4   | setLoading(true), limpiar errores                             | Proceso   |
| N5   | Inicio bloque try                                             | Proceso   |
| N6   | Llamada API: registrationService.createEntity(formData)       | Proceso   |
| N7   | Decisión: ¿response.success === true?                         | Decisión  |
| N8   | Éxito: mostrar mensaje y redirigir a registro admin           | Proceso   |
| N9   | Inicio bloque catch (error capturado)                         | Proceso   |
| N10  | Decisión: ¿err.status === 422 && err.errors?                  | Decisión  |
| N11  | Mapear errores de validación del backend a los campos         | Proceso   |
| N12  | Mostrar error genérico del servidor                           | Proceso   |
| N13  | Bloque finally                                                | Proceso   |
| N14  | setLoading(false) - Fin del flujo                             | Fin       |
+------+---------------------------------------------------------------+-----------+

ARISTAS (CONEXIONES ENTRE NODOS):
+----------+--------------------------------------------------------------+
| ARISTA   | CONDICIÓN                                                    |
+----------+--------------------------------------------------------------+
| N1 -> N2 | Siempre (después de preventDefault)                          |
| N2 -> N3 | validateForm() retorna false                                 |
| N2 -> N4 | validateForm() retorna true                                  |
| N4 -> N5 | Siempre                                                      |
| N5 -> N6 | Siempre (entra al try)                                       |
| N6 -> N7 | La llamada API se completa sin excepción                     |
| N6 -> N9 | La llamada API lanza una excepción                           |
| N7 -> N8 | response.success === true                                    |
| N7 -> N13| response.success !== true (sin else, pasa a finally)         |
| N8 -> N13| Siempre (después de éxito, va a finally)                     |
| N9 -> N10| Siempre (evalúa tipo de error)                               |
| N10-> N11| err.status === 422 && err.errors existe                      |
| N10-> N12| Error no es 422 o no tiene campo errors                      |
| N11-> N13| Siempre (después de mapear errores, va a finally)            |
| N12-> N13| Siempre (después de error genérico, va a finally)            |
| N13-> N14| Siempre (ejecuta setLoading(false))                          |
+----------+--------------------------------------------------------------+

GRAFO DE FLUJO (Representación ASCII):

         +------+
         |  N1  |  e.preventDefault()
         +--+---+
            |
         +--v---+
    +----+  N2  +----+
    |    +------+    |
    | false          | true
 +--v---+         +--v---+
 |  N3  |         |  N4  |
 +------+         +--+---+
   (FIN)             |
                  +--v---+
                  |  N5  |  try {
                  +--+---+
                     |
                  +--v---+
             +----+  N6  +----+
             |    +------+    |
             | sin excep.     | excepción
          +--v---+         +--v---+
     +----+  N7  |         |  N9  |  catch
     |    +--+---+         +--+---+
     |       |                |
     | true  | false       +--v---+
  +--v---+   |        +----+ N10  +----+
  |  N8  |   |        |    +------+    |
  +--+---+   |        | 422            | otro
     |       |     +--v---+         +--v---+
     |       |     | N11  |         | N12  |
     |       |     +--+---+         +--+---+
     |       |        |                |
     v       v        v                v
         +------+
         | N13  |  finally
         +--+---+
            |
         +--v---+
         | N14  |  FIN
         +------+

CÁLCULOS DE COMPLEJIDAD CICLOMÁTICA:
----------------------------------------------------------------------
  Fórmula 1: V(G) = Aristas - Nodos + 2
             V(G) = 16 - 14 + 2 = 4

  Fórmula 2: V(G) = Nodos de decisión + 1
             Nodos de decisión: N2, N7, N10 = 3
             V(G) = 3 + 1 = 4

  => Complejidad Ciclomática = 4
  => Esto significa que se requieren mínimo 4 caminos independientes.
----------------------------------------------------------------------

CAMINOS INDEPENDIENTES (CAMINOS BÁSICOS):
+----------+----------------------------------------------+------------------------------+
| CAMINO   | SECUENCIA DE NODOS                           | DESCRIPCIÓN                  |
+----------+----------------------------------------------+------------------------------+
| Camino 1 | N1 -> N2 -> N3                               | Validación frontend falla,   |
|          |                                              | formulario no se envía.      |
+----------+----------------------------------------------+------------------------------+
| Camino 2 | N1 -> N2 -> N4 -> N5 -> N6 -> N7 -> N8       | Validación OK, API exitosa,  |
|          | -> N13 -> N14                                | entidad creada, redirige.    |
+----------+----------------------------------------------+------------------------------+
| Camino 3 | N1 -> N2 -> N4 -> N5 -> N6 -> N9 -> N10      | Validación OK, API retorna   |
|          | -> N11 -> N13 -> N14                         | error 422 (validación back.) |
+----------+----------------------------------------------+------------------------------+
| Camino 4 | N1 -> N2 -> N4 -> N5 -> N6 -> N9 -> N10      | Validación OK, API retorna   |
|          | -> N12 -> N13 -> N14                         | error 500 (error servidor).  |
+----------+----------------------------------------------+------------------------------+


================================================================================
2. GRAFO DE FLUJO DE CONTROL - FUNCIÓN validateForm (Frontend)
   Archivo: RegisterEntity.tsx, líneas 104-147
================================================================================

CÓDIGO FUENTE SIMPLIFICADO:
----------------------------------------------------------------------
  const validateForm = (): boolean => {
V1:   const newErrors = {};
V2:   if (!formData.nombre_entidad.trim()) {          // Decisión
V3:       newErrors.nombre_entidad = 'obligatorio';
      } else if (!REGEX.ENTITY_NAME.test(...)) {
V4:       newErrors.nombre_entidad = 'sin números';
      }
V5:   if (!formData.correo.trim()) {                  // Decisión
V6:       newErrors.correo = 'obligatorio';
      } else if (!REGEX.EMAIL.test(...)) {
V7:       newErrors.correo = 'formato inválido';
      }
V8:   if (!formData.direccion.trim()) {               // Decisión
V9:       newErrors.direccion = 'obligatoria';
      } else if (!REGEX.DIRECCION.test(...)) {
V10:      newErrors.direccion = 'caracteres no permitidos';
      }
V11:  if (!formData.nombre_titular.trim()) {          // Decisión
V12:      newErrors.nombre_titular = 'obligatorio';
      } else if (/\d/.test(...)) {
V13:      newErrors.nombre_titular = 'sin números';
      } else if (value.trim().length < 8) {
V14:      newErrors.nombre_titular = 'min 8 caracteres';
      }
V15:  if (!formData.telefono.trim()) {                // Decisión
V16:      newErrors.telefono = 'obligatorio';
      } else if (!REGEX.PHONE.test(...)) {
V17:      newErrors.telefono = 'formato inválido';
      }
V18:  if (!formData.nit.trim()) {                     // Decisión
V19:      newErrors.nit = 'obligatorio';
      } else if (!REGEX.NIT.test(...)) {
V20:      newErrors.nit = 'formato inválido';
      }
V21:  setFieldErrors(newErrors);
V22:  return Object.keys(newErrors).length === 0;     // FIN
  };
----------------------------------------------------------------------

IDENTIFICACIÓN DE NODOS:
+------+---------------------------------------------------------------+-----------+
| NODO | DESCRIPCIÓN                                                   | TIPO      |
+------+---------------------------------------------------------------+-----------+
| V1   | Inicio: crear objeto newErrors vacío                          | Proceso   |
| V2   | Decisión: nombre_entidad vacío? / no cumple regex?            | Decisión  |
| V3   | Error: nombre_entidad obligatorio                             | Proceso   |
| V4   | Error: nombre_entidad contiene números                        | Proceso   |
| V5   | Decisión: correo vacío? / no cumple regex?                    | Decisión  |
| V6   | Error: correo obligatorio                                     | Proceso   |
| V7   | Error: correo formato inválido                                | Proceso   |
| V8   | Decisión: dirección vacía? / no cumple regex?                 | Decisión  |
| V9   | Error: dirección obligatoria                                  | Proceso   |
| V10  | Error: dirección caracteres no permitidos                     | Proceso   |
| V11  | Decisión: nombre_titular vacío? / números? / longitud?        | Decisión  |
| V12  | Error: nombre_titular obligatorio                             | Proceso   |
| V13  | Error: nombre_titular contiene números                        | Proceso   |
| V14  | Error: nombre_titular menos de 8 caracteres                   | Proceso   |
| V15  | Decisión: teléfono vacío? / no cumple regex?                  | Decisión  |
| V16  | Error: teléfono obligatorio                                   | Proceso   |
| V17  | Error: teléfono formato inválido                              | Proceso   |
| V18  | Decisión: NIT vacío? / no cumple regex?                       | Decisión  |
| V19  | Error: NIT obligatorio                                        | Proceso   |
| V20  | Error: NIT formato inválido                                   | Proceso   |
| V21  | setFieldErrors(newErrors)                                     | Proceso   |
| V22  | Retornar true si no hay errores, false si los hay             | Fin       |
+------+---------------------------------------------------------------+-----------+


================================================================================
3. GRAFO DE FLUJO DE CONTROL - FUNCIÓN store (Backend Controller)
   Archivo: EntidadController.php, líneas 21-71
================================================================================

NOTA: Laravel ejecuta automáticamente la validación del FormRequest
(StoreEntidadRequest) ANTES de entrar al método store(). Si la validación
falla, Laravel lanza una excepción HttpResponseException con código 422
y NUNCA se ejecuta el cuerpo de store(). Esto se modela como un nodo
de decisión previo.

CÓDIGO FUENTE SIMPLIFICADO:
----------------------------------------------------------------------
  // PASO PREVIO AUTOMÁTICO DE LARAVEL:
S0:  Recibir petición HTTP POST
S1:  StoreEntidadRequest->authorize()      // Autorizado?
S2:  StoreEntidadRequest->rules()          // Ejecutar reglas de validación
     (incluye ValidNit rule)
S3:  Validación pasó?                      // Decisión
S4:      failedValidation() -> Respuesta 422 con errores   // Si falló

  // MÉTODO store() DEL CONTROLADOR:
  public function store(StoreEntidadRequest $request) {
S5:   try {
S6:       $entidad = Entidades::create([...]);   // Crear entidad en BD
S7:       // Éxito: Respuesta 201
          return response()->json(['success' => true, ...], 201);
      } catch (QueryException $e) {
S8:       if ($e->errorInfo[1] == 1062) {        // Decisión: Duplicado?
S9:           // Error duplicado: Respuesta 422
              return response()->json(['success' => false, ...], 422);
          }
S10:      // Error de BD genérico: Respuesta 500
          return response()->json(['success' => false, ...], 500);
      } catch (Exception $e) {
S11:      // Error genérico: Respuesta 500
          return response()->json(['success' => false, ...], 500);
      }
  }
----------------------------------------------------------------------

IDENTIFICACIÓN DE NODOS:
+------+---------------------------------------------------------------+-----------+
| NODO | DESCRIPCIÓN                                                   | TIPO      |
+------+---------------------------------------------------------------+-----------+
| S0   | Recibir petición HTTP POST /api/registration/entidades        | Proceso   |
| S1   | Ejecutar authorize() del FormRequest (retorna true)           | Proceso   |
| S2   | Ejecutar reglas de validación (rules + ValidNit)              | Proceso   |
| S3   | Decisión: ¿La validación del FormRequest pasó?                | Decisión  |
| S4   | failedValidation(): Respuesta JSON 422 con errores            | Fin       |
| S5   | Entrar al bloque try del método store()                       | Proceso   |
| S6   | Entidades::create() - Insertar en base de datos               | Proceso   |
| S7   | Éxito: Respuesta JSON 201 con datos de la entidad             | Fin       |
| S8   | Decisión: ¿Es error de duplicado (código 1062)?               | Decisión  |
| S9   | Respuesta JSON 422: NIT/correo/nombre ya registrado           | Fin       |
| S10  | Respuesta JSON 500: Error genérico de base de datos           | Fin       |
| S11  | Respuesta JSON 500: Error genérico del servidor               | Fin       |
+------+---------------------------------------------------------------+-----------+

ARISTAS (CONEXIONES ENTRE NODOS):
+----------+--------------------------------------------------------------+
| ARISTA   | CONDICIÓN                                                    |
+----------+--------------------------------------------------------------+
| S0 -> S1 | Siempre                                                      |
| S1 -> S2 | authorize() retorna true                                     |
| S2 -> S3 | Siempre (después de ejecutar reglas)                         |
| S3 -> S4 | La validación falla (algún campo inválido)                   |
| S3 -> S5 | La validación pasa exitosamente                              |
| S5 -> S6 | Siempre (entra al try)                                       |
| S6 -> S7 | create() se ejecuta sin excepción                            |
| S6 -> S8 | create() lanza QueryException                                |
| S6 -> S11| create() lanza Exception genérica                            |
| S8 -> S9 | errorInfo[1] == 1062 (duplicado)                             |
| S8 -> S10| errorInfo[1] != 1062 (otro error de BD)                      |
+----------+--------------------------------------------------------------+

GRAFO DE FLUJO (Representación ASCII):

         +------+
         |  S0  |  Recibir POST
         +--+---+
            |
         +--v---+
         |  S1  |  authorize()
         +--+---+
            |
         +--v---+
         |  S2  |  rules() + ValidNit
         +--+---+
            |
         +--v---+
    +----+  S3  +----+
    |    +------+    |
    | falla          | pasa
 +--v---+         +--v---+
 |  S4  |         |  S5  |  try {
 +------+         +--+---+
 (422)               |
                  +--v---+
          +-------+  S6  +--------+
          |       +--+---+        |
          | Query    | OK         | Exception
          | Except.  |            |
       +--v---+   +--v---+    +--v---+
  +----+  S8  |   |  S7  |    | S11  |
  |    +------+   +------+    +------+
  | 1062    |otro  (201)       (500)
+-v--+  +--v---+
| S9 |  | S10  |
+----+  +------+
(422)    (500)

CÁLCULOS DE COMPLEJIDAD CICLOMÁTICA:
----------------------------------------------------------------------
  Nodos de decisión: S3, S8, y bifurcación try/catch en S6
  V(G) = 3 + 1 = 4
----------------------------------------------------------------------

CAMINOS INDEPENDIENTES:
+----------+-------------------------------------------+------------------------------+
| CAMINO   | SECUENCIA DE NODOS                        | DESCRIPCIÓN                  |
+----------+-------------------------------------------+------------------------------+
| Camino 1 | S0 -> S1 -> S2 -> S3 -> S4                | Validación del FormRequest   |
|          |                                           | falla -> respuesta 422.      |
+----------+-------------------------------------------+------------------------------+
| Camino 2 | S0 -> S1 -> S2 -> S3 -> S5 -> S6 -> S7    | Todo OK -> entidad creada    |
|          |                                           | -> respuesta 201.            |
+----------+-------------------------------------------+------------------------------+
| Camino 3 | S0 -> S1 -> S2 -> S3 -> S5 -> S6 -> S8   | Excepción de duplicado       |
|          | -> S9                                     | -> respuesta 422.            |
+----------+-------------------------------------------+------------------------------+
| Camino 4 | S0 -> S1 -> S2 -> S3 -> S5 -> S6 -> S11   | Excepción genérica del       |
|          |                                           | servidor -> respuesta 500.   |
+----------+-------------------------------------------+------------------------------+


================================================================================
4. GRAFO DE FLUJO - REGLA ValidNit (Backend)
   Archivo: ValidNit.php, líneas 16-35
================================================================================

CÓDIGO FUENTE SIMPLIFICADO:
----------------------------------------------------------------------
  public function validate($attribute, $value, $fail) {
NIT1:  if (!is_string($value)) {                    // Decisión
NIT2:      $fail('debe ser cadena de texto');
           return;
       }
NIT3:  if (!preg_match('/^[0-9-]{8,17}$/', $value)) {  // Decisión
NIT4:      $fail('formato inválido');
           return;
       }
NIT5:  if (!NitService::validateNit($value)) {       // Decisión
NIT6:      $fail('dígito de verificación inválido');
       }
NIT7:  // FIN (NIT válido, sin error)
  }
----------------------------------------------------------------------

IDENTIFICACIÓN DE NODOS:
+------+---------------------------------------------------------------+-----------+
| NODO | DESCRIPCIÓN                                                   | TIPO      |
+------+---------------------------------------------------------------+-----------+
| NIT1 | Decisión: ¿El valor es de tipo string?                        | Decisión  |
| NIT2 | Fallo: El valor no es string -> $fail()                       | Fin       |
| NIT3 | Decisión: ¿Cumple regex /^[0-9-]{8,17}$/?                     | Decisión  |
| NIT4 | Fallo: formato inválido -> $fail()                            | Fin       |
| NIT5 | Decisión: ¿NitService::validateNit() retorna true?            | Decisión  |
| NIT6 | Fallo: dígito de verificación inválido -> $fail()             | Fin       |
| NIT7 | NIT válido, validación pasa sin error                         | Fin       |
+------+---------------------------------------------------------------+-----------+

ARISTAS:
+-------------+--------------------------------------------------------------+
| ARISTA      | CONDICIÓN                                                    |
+-------------+--------------------------------------------------------------+
| NIT1 -> NIT2| El valor NO es string                                        |
| NIT1 -> NIT3| El valor SÍ es string                                        |
| NIT3 -> NIT4| NO cumple regex de formato                                   |
| NIT3 -> NIT5| SÍ cumple regex de formato                                   |
| NIT5 -> NIT6| validateNit() retorna false (DV incorrecto)                  |
| NIT5 -> NIT7| validateNit() retorna true (NIT completamente válido)        |
+-------------+--------------------------------------------------------------+

GRAFO DE FLUJO (Representación ASCII):

         +------+
         | NIT1 |  ¿Es string?
         +--+---+
            |
       +----+----+
       | NO      | SÍ
    +--v---+  +--v---+
    | NIT2 |  | NIT3 |  ¿Cumple regex?
    +------+  +--+---+
    (fallo)      |
            +----+----+
            | NO      | SÍ
         +--v---+  +--v---+
         | NIT4 |  | NIT5 |  ¿DV válido?
         +------+  +--+---+
         (fallo)      |
                 +----+----+
                 | NO      | SÍ
              +--v---+  +--v---+
              | NIT6 |  | NIT7 |
              +------+  +------+
              (fallo)    (éxito)

CÁLCULOS DE COMPLEJIDAD CICLOMÁTICA:
  V(G) = 3 nodos de decisión + 1 = 4

CAMINOS INDEPENDIENTES:
+----------+----------------------------------------+-------------------------------+
| CAMINO   | SECUENCIA DE NODOS                     | DESCRIPCIÓN                   |
+----------+----------------------------------------+-------------------------------+
| Camino 1 | NIT1 -> NIT2                           | Valor no es string.           |
| Camino 2 | NIT1 -> NIT3 -> NIT4                   | Formato regex inválido.       |
| Camino 3 | NIT1 -> NIT3 -> NIT5 -> NIT6           | Dígito verificación erróneo.  |
| Camino 4 | NIT1 -> NIT3 -> NIT5 -> NIT7           | NIT completamente válido.     |
+----------+----------------------------------------+-------------------------------+


================================================================================
5. FLUJO COMPLETO INTEGRADO (EXTREMO A EXTREMO)
================================================================================

El flujo completo desde que el usuario presiona "Siguiente" en el
formulario hasta que recibe una respuesta se resume así:

  [FRONTEND]                              [BACKEND]
  ----------                              ---------
  +-------------------+
  | Usuario presiona  |
  | "Siguiente"       |
  +--------+----------+
           |
  +--------v----------+
  | handleSubmit()    |
  | preventDefault()  |
  +--------+----------+
           |
  +--------v----------+  NO
  | validateForm()    |------> Mostrar errores inline
  | Campos válidos?   |       (NO se envía al servidor)
  +--------+----------+
           | SÍ
  +--------v----------+
  | fetch() POST a   |
  | /api/registration |
  | /entidades        |
  +--------+----------+
           |                    +---------------------+
           | ---- HTTP ---->    | StoreEntidadRequest |
           |                    | authorize()         |
           |                    | rules() + ValidNit  |
           |                    +--------+------------+
           |                             |
           |                    +--------v------------+  NO
           |                    | Validación pasó?    |----> failedValidation()
           |                    +--------+------------+      Respuesta 422
           |                             | SÍ
           |                    +--------v------------+
           |                    | EntidadController   |
           |                    | store()             |
           |                    |   Entidades::create |
           |                    +--------+------------+
           |                             |
           |                    +--------v------------+
           |                    | Modelo setNitAttr() |
           |                    | (normalizar NIT)    |
           |                    +--------+------------+
           |                             |
           |                    +--------v------------+
           |               +----+ INSERT en BD       +----+
           |               |    +---------------------+   |
           |          OK   |                    Error      |
           |               |                               |
           |         Resp. 201               +---------+   |
           |         (éxito)                 |Duplicado|   |
           |                                 |  1062   |   |
           |                                 +--+---+--+   |
           |                              Sí   |   |  No   |
           |                           Resp.422|   |Resp.500|
           |                                   |   |       |
           |  <---- HTTP ----                  |   |       |
           |                                   |   |       |
  +--------v----------+
  | Procesar resp.    |
  | en catch/then     |
  +--------+----------+
           |
  +--------v----------+
  | Mostrar resultado |
  | al usuario        |
  +-------------------+


================================================================================
6. RESUMEN DE COMPLEJIDADES CICLOMÁTICAS
================================================================================

+----------------------------------+-------------+----------------------+
| FUNCIÓN / MÓDULO                 | V(G)        | CAMINOS BÁSICOS      |
+----------------------------------+-------------+----------------------+
| handleSubmit() [Frontend]        | 4           | 4                    |
| validateForm() [Frontend]        | 10          | 10                   |
| store() + FormRequest [Backend]  | 4           | 4                    |
| ValidNit::validate() [Backend]   | 4           | 4                    |
+----------------------------------+-------------+----------------------+
| TOTAL CAMINOS MÍNIMOS A PROBAR   |             | 22                   |
+----------------------------------+-------------+----------------------+


================================================================================
7. DATOS DE PRUEBA SUGERIDOS PARA CADA CAMINO
================================================================================

HANDLESUBMIT - CAMINO 1 (Validación frontend falla):
  Dato: Todos los campos vacíos -> validateForm() retorna false.

HANDLESUBMIT - CAMINO 2 (Éxito completo):
  Dato: {
    nombre_entidad: "Empresa Prueba Ejemplo",
    correo: "prueba@empresa.com",
    direccion: "Calle 123 Barrio Centro",
    nombre_titular: "Juan Carlos Perez Lopez",
    telefono: "3001234567",
    nit: "90012345-6"  (con DV válido según algoritmo DIAN)
  }

HANDLESUBMIT - CAMINO 3 (Error 422 del backend):
  Dato: Campos válidos pero correo o NIT duplicado en BD.

HANDLESUBMIT - CAMINO 4 (Error 500 del servidor):
  Dato: Campos válidos pero BD desconectada o error interno.

VALIDNIT - CAMINO 1 (No es string):
  Dato: nit = 12345 (número, no string)

VALIDNIT - CAMINO 2 (Regex falla):
  Dato: nit = "ABC123"

VALIDNIT - CAMINO 3 (DV incorrecto):
  Dato: nit = "90012345-0" (DV calculado debería ser diferente)

VALIDNIT - CAMINO 4 (NIT válido):
  Dato: nit = "90012345-6" (DV correcto según algoritmo)


================================================================================
  FIN DEL DOCUMENTO
  Fecha de generación: 2026-03-03
  Proyecto: Proyecto-entrada-y-salida
  Módulo analizado: Formulario de Registro de Entidad
================================================================================
