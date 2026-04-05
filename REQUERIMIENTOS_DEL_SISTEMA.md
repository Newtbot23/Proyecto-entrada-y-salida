# REQUERIMIENTOS DEL SISTEMA
## Sistema de Control de Acceso, Gestión de Fichas y Equipos SENA

**Versión:** 1.0  
**Fecha de extracción:** 2026-04-01  
**Método:** Ingeniería Inversa sobre código fuente (Backend Laravel + Frontend React)  
**Entidad objetivo:** Centros de formación SENA (Colombia)

---

## ÍNDICE DE MÓDULOS

| Módulo | RF desde | RF hasta |
| :--- | :--- | :--- |
| Autenticación y Registro | RF-01 | RF-05 |
| Control de Acceso Físico (Puertas) | RF-06 | RF-10 |
| Gestión de Fichas de Formación | RF-11 | RF-20 |
| Gestión de Equipos | RF-21 | RF-26 |
| Asignación de Equipos (SENA) | RF-27 | RF-32 |
| Dashboard del Usuario Regular | RF-33 | RF-40 |
| Áreas Administrativas | RF-41 | RF-43 |
| Reportes | RF-44 | RF-46 |
| CRUD Dinámico (Tablas Cortas) | RF-47 | RF-47 |
| Gestión Multi-entidad (SuperAdmin) | RF-48 | RF-50 |

---

## REQUERIMIENTOS FUNCIONALES

---

### MÓDULO 1: AUTENTICACIÓN Y REGISTRO

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-01 |
| **Nombre de requisito** | Registro de Entidad y Administrador Normal |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `RegistrationFlowController.php`, `EntidadController.php`, `UsuariosController.php` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema permite el registro completo de una nueva institución (entidad) junto con su administrador principal mediante un flujo en tres pasos secuenciales: (1) `POST /registration/entidades` crea el registro de la entidad con su NIT; (2) `POST /registration/licencias` vincula un plan de licenciamiento; (3) `POST /registration/usuarios` crea el usuario administrador asociado al NIT. Existe también un endpoint consolidado `POST /registration/full` para el flujo completo en una sola llamada. El campo `nit_entidad` en el modelo `Usuarios` mantiene la separación multi-tenant de datos entre entidades.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-02 |
| **Nombre de requisito** | Autenticación de Administrador Normal (JWT/Sanctum) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `NormalAdminAuthController.php`; Frontend — `NormalAdminLogin.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema provee un endpoint `POST /normaladmin/login` que autentica al administrador de entidad mediante documento y contraseña. Al autenticarse exitosamente, Laravel Sanctum genera y retorna un token de acceso que el frontend almacena en contexto (`AuthContext`) y adjunta en la cabecera `Authorization: Bearer` a todas las peticiones subsiguientes. Todas las rutas bajo el grupo `middleware('auth:sanctum')` requieren este token para ser accedidas.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-03 |
| **Nombre de requisito** | Recuperación de Contraseña por Código |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `PasswordRecoveryApiController.php`; Frontend — `ForgotPassword.tsx`, `VerifyCode.tsx`, `ResetPassword.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema implementa un flujo de recuperación de contraseña en tres pasos: (1) `POST /forgot-password` recibe el correo del usuario y envía un código de verificación temporal; (2) `POST /verify-code` valida que el código ingresado sea correcto y esté vigente; (3) `POST /reset-password` permite establecer la nueva contraseña una vez verificado el código. El flujo es accesible públicamente sin autenticación.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-04 |
| **Nombre de requisito** | Registro de Usuario Regular mediante QR |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `UsuariosController.php` (`registerWithQr`, `generateQr`); Frontend — `UserBarcode.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema permite que los usuarios se auto-registren escaneando un código QR generado por el administrador (`GET /user/qr-registro`). El endpoint público `POST /usuarios/qr-register` recibe los datos del formulario y crea la cuenta del usuario. El usuario autenticado puede consultar su código de barras personal en formato Base64 (`GET /user/barcode-base64`), el cual puede ser escaneado en los puntos de control de acceso para agilizar el proceso de entrada/salida.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-05 |
| **Nombre de requisito** | Gestión de Estado de Usuario (Habilitado/Inhabilitado) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `UsuariosController.php` (`toggleEstado`) |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede activar o inactivar a cualquier usuario de su entidad mediante `PATCH /usuarios/{doc}/estado`. Esta funcionalidad permite bloquear el acceso de un usuario al sistema sin eliminarlo, preservando su historial de registros y asignaciones. El campo `estado` del modelo `Usuarios` controla esta condición.

---

### MÓDULO 2: CONTROL DE ACCESO FÍSICO (PUERTAS — PORTERÍA)

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-06 |
| **Nombre de requisito** | Búsqueda de Persona para Control de Acceso |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `PuertasController::searchPersona()`; Frontend — `PersonasDashboard.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema permite al personal de portería buscar a un usuario por su número de documento (`GET /puertas/search-persona?doc={doc}`). La consulta retorna: datos personales del usuario, listado de equipos propios activos con su marca y serial, y el estado actual (dentro o fuera de las instalaciones). Si existe un registro abierto (sin `hora_salida`), se retorna el detalle de ese registro incluyendo los seriales de los equipos que ingresaron. La búsqueda está restringida a usuarios de la misma entidad (`nit_entidad`) del agente de portería autenticado.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-07 |
| **Nombre de requisito** | Registro de Entrada con Validación de Doble Escaneo |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `PuertasController::registrarActividad()`; Frontend — `PersonasDashboard.tsx` (lógica `documentoEsperado`) |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El registro de entrada se ejecuta mediante `POST /puertas/registrar-actividad` con `accion: 'entrada'`. El sistema crea un registro en la tabla `registros` con fecha y `hora_entrada`, y opcionalmente registra los seriales de los equipos que ingresan en la tabla `registros_equipos`. A nivel de frontend, se implementa una capa de seguridad anti-escaneo-accidental: el primer escaneo del documento busca al usuario y activa un período de espera de 4 segundos; un segundo escaneo del **mismo documento** dentro de ese período confirma y ejecuta la acción. Un escaneo de un documento diferente durante la espera cancela la operación y muestra un error. La operación completa se ejecuta en una transacción de base de datos.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-08 |
| **Nombre de requisito** | Registro de Salida |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `PuertasController::registrarActividad()`; Frontend — `PersonasDashboard.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El registro de salida se ejecuta con `POST /puertas/registrar-actividad` con `accion: 'salida'` y el `id_registro` del registro abierto. El sistema actualiza el campo `hora_salida` del registro existente, cerrando el ciclo de presencia. Si el usuario está marcado como "adentro" (registro sin `hora_salida`), el sistema pre-selecciona automáticamente los equipos con los que ingresó para afirmar que los mismos equipos están saliendo, evitando inconsistencias.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-09 |
| **Nombre de requisito** | Control de Acceso de Vehículos |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `PuertasController::searchVehiculo()`; Frontend — `VehiculosDashboard.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El módulo de vehículos en portería permite buscar por placa o por número de documento del propietario (`GET /puertas/search-vehiculo?query={placa_o_doc}`). El sistema retorna todos los vehículos activos que coincidan, junto con la información del propietario y sus equipos propios. También muestra si el propietario tiene registros de entrada abiertos. Este módulo es una vista paralela e independiente del módulo de personas, diseñada para puntos de control vehicular.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-10 |
| **Nombre de requisito** | Alerta de Sesión Prolongada |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `UserDashboardController::checkActiveSession()`; Frontend — `UserDashboard.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema detecta si un usuario tiene una sesión de entrada sin cerrar que superó las 6.5 horas (`GET /user/check-active-session`). El backend calcula la diferencia en minutos entre la hora de entrada y el momento actual. Si se supera el umbral, el frontend muestra una alerta visual al usuario para recordarle que debe registrar su salida, previniendo inconsistencias en el registro histórico.

---

### MÓDULO 3: GESTIÓN DE FICHAS DE FORMACIÓN

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-11 |
| **Nombre de requisito** | Creación de Ficha de Formación |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::store()`; Frontend — `FichasCreate.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede crear fichas de formación mediante `POST /fichas`. Una ficha requiere: `numero_ficha` (único, entero), `id_programa` (FK a la tabla `programas`), `numero_ambiente` (FK a la tabla `ambientes`) e `id_jornada` (FK a la tabla `jornadas`). El estado inicial de la ficha es `lectiva`. El sistema valida unicidad del número de ficha. Los catálogos de programas, ambientes y jornadas son accesibles mediante `GET /fichas/catalogs` para poblar los selectores del formulario.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-12 |
| **Nombre de requisito** | Asignación de Usuarios a Ficha mediante Drag & Drop |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::asignarUsuarios()`; Frontend — `FichasAssign.tsx` (usando `@hello-pangea/dnd`) |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema presenta una interfaz de tablero de dos columnas con arrastrar-y-soltar: la columna izquierda muestra la ficha seleccionada (inicialmente vacía), y la derecha lista los usuarios disponibles. El administrador arrastra usuarios hacia la ficha. Al guardar (`POST /fichas/{id}/asignar`), el backend ejecuta un `sync()` sobre la tabla pivote `detalle_ficha_usuarios`, preservando los roles preexistentes. Los usuarios nuevos reciben automáticamente el rol `aprendiz`. La lista de usuarios disponibles excluye a los aprendices activos en otras fichas no finalizadas. Los usuarios que ya son instructores en fichas activas reciben un badge visual de advertencia ("Instructor previo") al fondo de la lista. Los usuarios pertenecientes a Áreas Administrativas aparecen al fondo de la lista con un badge de su área (color índigo), indicando que son personal de administración.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-13 |
| **Nombre de requisito** | Regla de Un Solo Instructor por Ficha |
| **Tipo** | [x] Restricción [ ] Requisito |
| **Fuente del requisito** | Backend — `FichaController::actualizarRolParticipante()` y `actualizarRolPorFichaYUsuario()` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema aplica la restricción de que cada ficha puede tener como máximo **un único instructor** registrado. Al intentar promover a un aprendiz al rol de instructor (`PATCH /fichas/detalle/{detalle_id}` o `PATCH /fichas/{id}/usuarios/{doc}/rol`), el backend verifica si ya existe otro usuario con `tipo_participante = 'instructor'` en esa ficha. Si ya existe, retorna un error HTTP 422 con el mensaje "Esta ficha ya tiene un instructor asignado." Esta restricción no se puede circunvalar desde el frontend.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-14 |
| **Nombre de requisito** | Protección de Instructor contra Desvinculación Directa |
| **Tipo** | [x] Restricción [ ] Requisito |
| **Fuente del requisito** | Backend — `FichaController::desvincularUsuario()` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema impide eliminar a un usuario de una ficha si su `tipo_participante` es `instructor`. Al intentar hacerlo vía `DELETE /fichas/{id}/usuarios/{doc}`, el backend retorna un HTTP 403 con el mensaje "No se puede remover a un instructor activo. Cámbiele el rol a aprendiz primero en Gestión de Usuarios." Esto garantiza que el instructor siempre es desvinculado mediante un cambio explícito de rol, nunca accidentalmente.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-15 |
| **Nombre de requisito** | Cambio de Estado de Ficha |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::cambiarEstado()`; Frontend — `FichasList.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede cambiar el estado de una ficha (`PATCH /fichas/{id}/estado`) entre los valores: `lectiva`, `productiva` y `finalizada`. El listado de fichas (`GET /fichas`) ordena los resultados usando `FIELD(estado, 'lectiva', 'productiva', 'finalizada')`, asegurando que las fichas activas aparezcan siempre primero. Las fichas con estado `finalizada` liberan a sus aprendices, permitiéndoles ser asignados a nuevas fichas.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-16 |
| **Nombre de requisito** | Gestión Detallada de Usuarios de Ficha (Vista de Asignación de Equipos) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::getUsuariosDeFicha()`; Frontend — `AsignarEquipos.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema lista los usuarios de una ficha con información enriquecida (`GET /fichas/{id}/usuarios-detallados`), incluyendo: tipo de participante (aprendiz/instructor), datos de la entidad, tipo de documento, y el campo calculado `equipo_info` que describe el equipo asignado activo del usuario (SENA con placa y serial, "Aplica equipo propio" o "Sin equipo asignado"). El frontend en `AsignarEquipos.tsx` separa visualmente a los integrantes de la ficha en dos tablas — Integrantes y Equipos disponibles — con modales de detalle para cada fila.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-17 |
| **Nombre de requisito** | Actualización del Ambiente Físico de una Ficha (Mudanza) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::updateAmbiente()`; Frontend — `AsignarEquipos.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede reubicar una ficha a un nuevo ambiente físico (`PATCH /fichas/{id}/ambiente`). El sistema ejecuta una transacción de tres pasos: **1) Limpieza:** Las asignaciones `EN_USO` de los aprendices en el lote del ambiente anterior se marcan como `DEVUELTO`; si el equipo ya no tiene otras asignaciones activas, su estado vuelve a `no_asignado`. **2) Actualización:** Se actualiza el `numero_ambiente` de la ficha. **3) Reasignación:** Si el nuevo ambiente tiene un lote vinculado, se dispara automáticamente el motor de asignación `AsignacionController::ejecutarAsignacion()` para proveer equipos del nuevo lote a los aprendices.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-18 |
| **Nombre de requisito** | Configuración de Hora Límite de Llegada por Ficha |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::updateHoraLimite()`; Frontend — `AsistenciaFicha.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El instructor puede configurar la hora límite de llegada de su ficha (`PATCH /fichas/{id}/hora-limite`). Este valor en formato `HH:mm` se almacena en la columna `hora_limite_llegada` de la tabla `fichas` y es utilizado por el módulo de asistencia mensual para determinar si un aprendiz llegó "tarde" en cada día registrado. El valor predeterminado cuando no está configurado es `07:15`.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-19 |
| **Nombre de requisito** | Consulta de Asistencia Mensual por Ficha (Vista Instructor) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::getInstructorAsistenciaMensual()` y `getAsistenciaMensual()`; Frontend — `AsistenciaFicha.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El instructor puede consultar la asistencia mensual de todos los aprendices de su ficha (`GET /instructor/asistencia-mensual?mes={M}&anio={A}&ficha_id={ID}`). El backend valida que el usuario autenticado sea efectivamente instructor de la ficha solicitada antes de retornar los datos. La respuesta incluye, para cada aprendiz, todos sus registros del mes con `fecha`, `hora_entrada` y `hora_salida`, lo que permite al frontend construir una tabla de asistencia de tipo "calendario mensual" evaluando puntualidad vs. `hora_limite_llegada`. El sistema soporta múltiples fichas por instructor mediante el parámetro `ficha_id`.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-20 |
| **Nombre de requisito** | Consulta de Equipos Asignados a la Ficha (Vista Instructor) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::getInstructorEquiposAsignados()`; Frontend — `EquiposAsignados.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El instructor puede ver qué equipo SENA está asignado a cada aprendiz de su ficha (`GET /instructor/equipos-asignados`). El backend cruza los aprendices de la ficha con sus asignaciones activas y retorna una lista consolidada con: documento del aprendiz, nombre completo, serial del equipo, placa SENA, modelo y descripción del tipo de equipo. Solo se muestran equipos con estado `activo` en la tabla `asignaciones`.

---

### MÓDULO 4: GESTIÓN DE EQUIPOS

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-21 |
| **Nombre de requisito** | Registro Manual de Equipo Institucional (SENA) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `EquipoController::store()`; Frontend — `RegistrarEquipos.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede registrar equipos institucionales individualmente (`POST /equipos`). Los equipos de categoría `Computo` o `Electronica` requieren `serial` (único), `id_marca` e `id_sistema_operativo` como campos obligatorios. Para categorías `Herramientas` u `Otros`, el serial es opcional y el sistema genera uno automático con el formato `GEN-USR-{userId}-{timestamp}`. El estado inicial del equipo es definido por el administrador (`asignado`, `no_asignado` o `inhabilitado`) y su `estado_aprobacion` inicia en `pendiente` (para equipos propios) o `aprobado` (para equipos SENA).

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-22 |
| **Nombre de requisito** | Importación Masiva de Equipos desde CSV |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `EquipoController::importarCsv()`; Frontend — `GestionLotes.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema permite la carga masiva de equipos desde un archivo CSV (`POST /equipos/importar`). El archivo debe tener las columnas en este orden: `serial`, `categoria`, `placa_sena`, `marca`, `modelo`, `sistema_operativo`, `descripcion`, `caracteristicas`. El backend valida el MIME type del archivo (`csv/txt`). Por cada importación, se crea automáticamente un registro `Lote` con un código único (`LOTE-YYYYMMDD-XXXX`). Filas con `categoria`, `modelo` o descripción vacíos son ignoradas. Si el serial está vacío para categorías Herramientas/Otros, se genera automáticamente. Las marcas y sistemas operativos se resuelven por nombre en las tablas de catálogo. Todos los equipos importados se crean con `tipo_equipo: 'sena'` y `estado_aprobacion: 'aprobado'`. Toda la importación se ejecuta en una transacción que garantiza atomicidad.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-23 |
| **Nombre de requisito** | Gestión de Lotes de Importación |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `EquipoController::getLotes()`, `renombrarLote()`, `moverEquipoLote()`; Frontend — `GestionLotes.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** Cada importación CSV crea un `Lote` identificado por un código autogenerado. El administrador puede listar todos los lotes con el conteo de equipos que contienen y el ambiente físico vinculado (`GET /equipos/lotes`). También puede renombrar un lote (`PUT /equipos/lotes/renombrar`) y mover un equipo individual de un lote a otro (`PUT /equipos/{id}/mover-lote`). La vista `GestionLotes.tsx` presenta una tabla con los equipos de cada lote seleccionado, permitiendo filtrar por lote o ver los "sin lote".

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-24 |
| **Nombre de requisito** | Vinculación de Lote a Ambiente Físico |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `EquipoController::updateLote()`; Frontend — `GestionLotes.tsx` (select de ambiente) |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede vincular un lote de equipos a un ambiente físico (salón/aula) mediante `PATCH /equipos/lotes/{id}/ambiente`. Esta vinculación es la base del sistema de asignación automática: cuando una ficha tiene como ambiente un aula con un lote vinculado, el motor de asignación sabrá qué pool de equipos utilizar. La relación es `1 lote → 1 ambiente` (un ambiente no puede tener múltiples lotes activos desde la perspectiva del motor, aunque la BD no lo restringe).

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-25 |
| **Nombre de requisito** | Registro de Activo Propio por el Usuario Regular |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `UserDashboardController::storeEquipo()`; Frontend — `UserDashboard.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El usuario regular puede registrar sus propios equipos de cómputo (`POST /user/equipos`). El equipo se crea con `tipo_equipo: 'propio'` y `estado_aprobacion: 'pendiente'`, lo que lo coloca en la cola de aprobación del administrador. Simultáneamente, se crea una asignación en la tabla `asignaciones` vinculando el equipo al usuario. El sistema acepta hasta dos fotografías del equipo (general y de detalle) que se almacenan en `storage/public/equipos` y se concatenan con el separador `|` en el campo `img_serial`. El OCR mediante Google Vision (`POST /ocr/read-serial`) puede asistir en la captura automática del número de serie desde una foto.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-26 |
| **Nombre de requisito** | Flujo de Aprobación de Activos (Equipos Propios y Vehículos) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `AprobacionesActivosController.php`; Frontend — `AprobacionesActivos.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema implementa un flujo de aprobación para los activos registrados por usuarios regulares. El administrador accede a la lista unificada de vehículos y equipos pendientes (`GET /admin/activos-pendientes`), ordenados por fecha de registro (más antiguo primero). Desde esta vista puede aprobar (`activo`) o rechazar (`inactivo`) cada activo mediante `PATCH /admin/activos/{tipo}/{id}/estado`. Solo los activos con `estado_aprobacion: 'activo'` son visibles en los puntos de control de acceso (portería). El usuario puede activar/inactivar sus propios activos mediante `PATCH /user/activos/{tipo}/{id}/toggle-estado`, lo que no requiere re-aprobación si ya fue aprobado antes.

---

### MÓDULO 5: ASIGNACIÓN AUTOMÁTICA DE EQUIPOS SENA

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-27 |
| **Nombre de requisito** | Motor de Asignación Jornada-Aware (Núcleo del Sistema) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `AsignacionController::ejecutarAsignacion()` (motor estático) |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El núcleo del sistema de asignación automática es el método estático `AsignacionController::ejecutarAsignacion(Ficha $ficha, Lote $lote)`. Este motor aplica tres reglas en orden: **Regla 1 (Exclusión de instructores):** Los usuarios con `tipo_participante = 'instructor'` en la ficha son omitidos; el instructor nunca recibe equipo SENA por este flujo. **Regla 2 (Lógica Incremental):** Un aprendiz que ya tiene una asignación `EN_USO` de equipos del mismo lote y en la misma jornada (definida por `id_jornada` de la ficha) es ignorado; esto permite re-ejecutar el proceso sin duplicar asignaciones. **Regla 3 (Disponibilidad por Jornada):** Un equipo del lote está disponible si no tiene ninguna asignación `EN_USO` cuya ficha tenga la misma `id_jornada` que la ficha en proceso. Esto permite que el mismo equipo físico sea compartido entre una ficha de turno mañana y otra de turno tarde. Se usa `lockForUpdate()` (bloqueo pesimista) para prevenir asignaciones duplicadas bajo concurrencia. Si el lote se agota, el procesamiento se detiene sin error.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-28 |
| **Nombre de requisito** | Asignación Masiva Manual de Equipos (Disparada por Administrador) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `AsignacionController::asignarMasivamente()`; Frontend — `AsignarEquipos.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede disparar manualmente el motor de asignación desde la vista `AsignarEquipos.tsx` seleccionando una ficha y un lote, y presionando el botón de asignación masiva (`POST /asignaciones/masivas`). El endpoint valida la existencia de ficha y lote, verifica que la ficha tenga usuarios vinculados, y délega al motor `ejecutarAsignacion()`. La respuesta incluye el número total de asignaciones realizadas y el detalle de cada asignación (documento del aprendiz, nombre, serial y placa del equipo asignado).

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-29 |
| **Nombre de requisito** | Asignación Automática al Sincronizar Usuarios con Ficha |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::asignarUsuarios()` (trigger silencioso) |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** Cuando el administrador sincroniza usuarios a una ficha (`POST /fichas/{id}/asignar`), el sistema verifica si el `numero_ambiente` de la ficha tiene un `Lote` vinculado. Si existe, se dispara silenciosamente `AsignacionController::ejecutarAsignacion()` como efecto secundario de la sincronización. Este disparo automático está envuelto en un bloque `try-catch` separado para garantizar que si falla (ej. sin equipos disponibles), la operación principal de sincronización de usuarios igual se complete exitosamente. El administrador no recibe notificación de las asignaciones automáticas en este flujo.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-30 |
| **Nombre de requisito** | Liberación de Equipos al Cambiar de Ambiente (Mudanza) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `FichaController::updateAmbiente()` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** La operación de mudanza (ver RF-17) incluye la liberación automática de equipos del lote anterior. El sistema identifica las asignaciones `EN_USO` de los aprendices en el lote del ambiente anterior, las marca como `DEVUELTO`, y si el equipo no tiene otras asignaciones activas en ninguna otra jornada, actualiza su estado a `no_asignado`. Esto garantiza que los equipos sean reutilizables para otras fichas que puedan estar en el mismo aula en diferente jornada.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-31 |
| **Nombre de requisito** | Consulta de Historial de Asignaciones |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `AsignacionController::obtenerHistorial()`; Frontend — `HistorialAsignaciones.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede consultar el historial completo de asignaciones de equipos (`GET /asignaciones/historial`). Los registros se agrupan por `codigo_asignacion` (que identifica un proceso de asignación batch) y se retornan ordenados por fecha descendente. Cada grupo incluye: fecha, número de ficha, código del lote, total de equipos asignados, y el desglose individual con documento y nombre del aprendiz, serial del equipo, placa SENA y estado actual de la asignación.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-32 |
| **Nombre de requisito** | Restricción: Equipos Propios Excluidos del Motor de Asignación |
| **Tipo** | [x] Restricción [ ] Requisito |
| **Fuente del requisito** | Backend — `EquipoController::getEquiposByLote()` (filtro `tipo_equipo != 'propio'`) |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema excluye explícitamente los equipos de tipo `propio` de la gestión por lotes. El endpoint `GET /equipos/por-lote` aplica un filtro fijo `where('tipo_equipo', '!=', 'propio')`, garantizando que los equipos personales de los usuarios nunca aparezcan en las listas de lotes institucionales ni sean susceptibles de asignación masiva. Esta separación es estructural y no configurable por el administrador.

---

### MÓDULO 6: DASHBOARD DEL USUARIO REGULAR

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-33 |
| **Nombre de requisito** | Registro y Gestión de Vehículos Propios |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `UserDashboardController::storeVehiculo()`, `getVehiculos()`; Frontend — `UserDashboard.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El usuario regular puede registrar sus vehículos (`POST /user/vehiculos`) especificando placa (convertida automáticamente a mayúsculas), tipo de vehículo, marca, modelo, color y hasta dos fotografías (general y de detalle, concatenadas con coma en `img_vehiculo`). El sistema soporta selects dependientes para tipo → marca de vehículo. Los vehículos creados inician con `estado_aprobacion: 'pendiente'`. El usuario puede consultar sus vehículos (`GET /user/vehiculos`) ordenados mostrando primero el predeterminado, y puede gestionar cuál es su vehículo predeterminado usando el toggle `set-default`. Un vehículo puede ser desactivado temporalmente sin necesidad de re-aprobación cambiando su estado.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-34 |
| **Nombre de requisito** | OCR para Lectura de Placa de Vehículo |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `UserDashboardController::readPlate()` + `GoogleVisionService`; Frontend — `UserDashboard.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema integra Google Cloud Vision API para reconocimiento óptico de caracteres. Al registrar un vehículo, el usuario puede tomar/cargar una foto de la placa (`POST /ocr/read-plate`). El backend envía la imagen en Base64 al `GoogleVisionService`, el cual extrae el texto y aplica lógica de parsing para identificar el número de placa. Si se detecta exitosamente, el frontend rellena automáticamente el campo de placa en el formulario.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-35 |
| **Nombre de requisito** | Consulta de Historial de Entradas y Salidas del Usuario |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `UserDashboardController::getEntradas()`; Frontend — `UserHistory.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El usuario puede consultar su historial de accesos (`GET /user/entradas`). Sin filtros, retorna las últimas 5 entradas; con el filtro `?fecha=YYYY-MM-DD`, retorna todos los registros de ese día. Cada registro incluye fecha, hora de entrada, hora de salida, placa del vehículo (si aplica), y los equipos con los que se registró (serial, modelo y marca de cada equipo). Los registros están ordenados por fecha y hora descendente.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-36 |
| **Nombre de requisito** | Exportación PDF del Historial Personal |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `ReportController::downloadUserHistory()`; Frontend — `UserHistory.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El usuario puede descargar su historial de accesos en formato PDF mediante `GET /user/history/export-pdf`. El sistema genera el reporte dinámicamente con los registros del usuario autenticado y lo retorna como descarga directa al navegador.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-37 |
| **Nombre de requisito** | Establecer Activo Predeterminado (Vehículo o Equipo) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `UserDashboardController::setDefaultAsset()`; Frontend — `UserDashboard.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El usuario puede marcar un vehículo o equipo propio como "predeterminado" (`PATCH /user/activos/{tipo}/{id}/set-default`). El sistema primero pone en `es_predeterminado = 0` a **todos** los activos del usuario del mismo tipo y luego establece `es_predeterminado = 1` al seleccionado. Los activos predeterminados son los que el sistema pre-selecciona automáticamente al registrar la entrada de la persona en portería (PersonasDashboard), agilizando el proceso de control de acceso.

---

### MÓDULO 7: ÁREAS ADMINISTRATIVAS

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-38 |
| **Nombre de requisito** | Creación de Áreas Administrativas |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `AreaController::store()`; Frontend — `GestionAreas.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede crear áreas organizativas para el personal no perteneciente a fichas (ej. "Coordinación Académica", "Portería", "Bienestar") mediante `POST /areas`. Cada área tiene un nombre único y una descripción opcional. El listado incluye el conteo de usuarios por área (`GET /areas`). La interfaz en `GestionAreas.tsx` presenta las áreas como pills (fichas clickeables) que activan el tablero de asignación de usuarios correspondiente.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-39 |
| **Nombre de requisito** | Asignación de Personal a Áreas Administrativas mediante Drag & Drop |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `AreaController::asignarUsuarios()`, `getUsuarios()`; Frontend — `GestionAreas.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** La vista `GestionAreas.tsx` implementa un tablero de arrastrar-y-soltar de dos columnas (miembros del área / usuarios disponibles) para asignar y desasignar personal de áreas. Al guardar, el backend ejecuta `sync()` sobre la tabla pivote `area_usuario`, reemplazando completamente la lista actual de usuarios del área con la nueva selección (`POST /areas/{id}/asignar`). La operación acepta un array de documentos (`doc`) de los usuarios a asignar.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-40 |
| **Nombre de requisito** | Indicador Visual de Personal Administrativo en el Asignador de Fichas |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `AreaController::getUsuariosAdministrativos()`; Frontend — `FichasAssign.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** Al abrir el asignador de usuarios a fichas (`FichasAssign.tsx`), el sistema consulta el mapa de personal administrativo (`GET /areas/administrativos`). Los usuarios que pertenecen a algún área administrativa reciben un badge morado con el nombre de su área en la columna de "Usuarios Disponibles". Adicionalmente, el algoritmo de ordenamiento empuja a estos usuarios al **fondo** de la lista automáticamente — sin eliminarlos — para evitar que interfieran visualmente cuando el instructor o administrador busca aprendices. El backend retorna un diccionario indexado por `doc` con el nombre del área de cada usuario administrativo.

---

### MÓDULO 8: REPORTES

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-41 |
| **Nombre de requisito** | Reporte Diario de Entradas y Salidas |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `ReportController::getDailyReport()`; Frontend — `ReporteDiario.tsx` |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede consultar el reporte de actividad diaria de la entidad (`GET /reports/daily`). Este reporte consolida todas las entradas y salidas ocurridas en una fecha, mostrando información del usuario, hora de entrada, hora de salida y equipos que ingresaron/salieron. El reporte es la herramienta principal del administrador para monitorear el flujo de personas y assets en tiempo real.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-42 |
| **Nombre de requisito** | Reporte de Historial por Persona |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `ReportController::getPersonReport()`; Frontend — `ReportePersona.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El administrador puede consultar el historial de accesos de cualquier usuario de su entidad (`GET /reports/person?doc={doc}`). Los datos se presentan en forma tabular con filtros de fecha y la opción de ver el detalle de cada entrada. Los datos también son exportables en PDF desde el sistema de reportes administrativos.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-43 |
| **Nombre de requisito** | Reportes de Licencias y Entidades (SuperAdmin) |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `ReportController::downloadLicenses()`, `downloadEntities()`, `downloadEntity()` |
| **Prioridad del requisito** | [ ] Alta/Esencial [ ] Media/Deseado [x] Baja/Opcional |

**Descripción del requerimiento:** El SuperAdministrador puede generar reportes descargables de todas las licencias del sistema (`GET /reports/licenses`), del resumen de todas las entidades registradas (`GET /reports/entities`), y del detalle de una entidad específica con sus usuarios y métricas (`GET /reports/entities/{nit}`). Estos reportes son exclusivos del panel de SuperAdmin y no están disponibles para administradores de entidad.

---

### MÓDULO 9: CRUD DINÁMICO (TABLAS CORTAS)

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-44 |
| **Nombre de requisito** | Gestión Dinámica de Tablas de Catálogo |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `DynamicTableController.php`; Frontend — `DynamicCrud.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema incluye un módulo de CRUD dinámico que permite al administrador gestionar las tablas de catálogo del sistema sin necesitar un endpoint dedicado para cada una. `GET /tablas-cortas` retorna la lista de tablas permitidas. `GET /esquema/{table}` infiere la estructura de columnas de la tabla para generar el formulario automáticamente. `GET/POST/PUT /datos/{table}/{id}` ejecutan las operaciones de lectura, creación y actualización. El sistema mantiene una **lista negra** de tablas que no pueden ser modificadas por esta vía (ej. `registros_equipos`, tablas del sistema), protegiendo los datos de negocio críticos.

---

### MÓDULO 10: GESTIÓN MULTI-ENTIDAD (SUPERADMIN)

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-45 |
| **Nombre de requisito** | Gestión de Planes de Licenciamiento |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `PlanController.php`, `LicenciasController.php`; Frontend — `LicensePlansPage.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El SuperAdmin gestiona los planes de licencias disponibles (CRUD completo vía `GET/POST/PUT/DELETE /planes`). Las entidades adquieren licencias que pueden ser activadas/desactivadas (`PUT /licencias/{id}/activate`, `PATCH /licencias-sistema/{id}/estado`). El administrador de entidad puede consultar su licencia actual (`GET /licencia-actual`) para conocer sus límites y vencimiento. El sistema integra Stripe para pagos en línea de licencias (`POST /stripe/checkout-session`, `POST /stripe/payment-success`).

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-46 |
| **Nombre de requisito** | Gestión Completa de Entidades e Instituciones |
| **Tipo** | [x] Requisito [ ] Restricción |
| **Fuente del requisito** | Backend — `EntidadController.php`, `AdminsController.php`; Frontend — `InstitutionsPage.tsx`, `EntityAdminsPage.tsx` |
| **Prioridad del requisito** | [ ] Alta/Esencial [x] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El SuperAdmin puede crear, leer, actualizar y eliminar entidades completas (CRUD en `/entidades`). Puede consultar los administradores asociados a cada entidad (`GET /entidades/{nit}/admins`) y gestionarlos desde un panel dedicado. Los administradores propios del SuperAdmin se gestionan vía `apiResource('admins', AdminsController)`. El modelo `Entidades` mantiene el NIT como clave primaria, que actúa como identificador multi-tenant en todo el sistema.

---

| Campo | Valor |
| :--- | :--- |
| **Número de requisito** | RF-47 |
| **Nombre de requisito** | Restricción: Aislamiento Multi-Tenant por Entidad |
| **Tipo** | [ ] Requisito [x] Restricción |
| **Fuente del requisito** | Backend — `Usuarios.php` (campo `nit_entidad`), `PuertasController.php` (filtro por `nit`) |
| **Prioridad del requisito** | [x] Alta/Esencial [ ] Media/Deseado [ ] Baja/Opcional |

**Descripción del requerimiento:** El sistema implementa aislamiento de datos por entidad mediante el campo `nit_entidad` en el modelo `Usuarios`. Todos los endpoints críticos de gestión y portería filtran los datos por el `nit_entidad` del usuario autenticado, garantizando que un administrador de una entidad A nunca pueda ver, modificar ni registrar actividades de usuarios pertenecientes a la entidad B. Esta restricción es aplicada a nivel de consulta de base de datos (no solo en UI) y no es bypasseable desde el frontend.

---

## RESTRICCIONES TÉCNICAS DEL SISTEMA

| # | Restricción | Fuente |
| :--- | :--- | :--- |
| RT-01 | La clave primaria del modelo `Equipo` es `serial` (string), no el `id` autonumérico convencional de Laravel. | `Equipo.php`, `AsignacionController.php` |
| RT-02 | La clave primaria del modelo `Usuarios` es `doc` (entero), no `id`. El tipo es `int`, no `bigint`. | `Usuarios.php`, migración `area_usuario` |
| RT-03 | Los estados válidos de asignación son: `EN_USO` y `DEVUELTO` (constantes en `Asignacion.php`). | `AsignacionController.php` |
| RT-04 | Los estados válidos de equipo son: `asignado`, `no_asignado`, `inhabilitado`. | `EquipoController.php` |
| RT-05 | Los estados válidos de ficha son: `lectiva`, `productiva`, `finalizada`. | `FichaController.php` |
| RT-06 | Las imágenes de vehículos se separan con coma (`,`); las de equipos se separan con pipe (`\|`). | `UserDashboardController.php` |
| RT-07 | Los equipos propios de usuarios nunca pueden ser asignados por el motor de asignación masiva. | `EquipoController::getEquiposByLote()` |
| RT-08 | El motor de asignación requiere que la ficha tenga `id_jornada` para la lógica de disponibilidad compartida. | `AsignacionController::ejecutarAsignacion()` |
| RT-09 | Todas las rutas bajo `middleware('auth:sanctum')` requieren token Sanctum válido. | `api.php` |
| RT-10 | Los desencadenantes de asignación automática (RF-29) son silenciosos y nunca bloquean la operación principal. | `FichaController::asignarUsuarios()` |

---

*Documento generado automáticamente mediante ingeniería inversa del código fuente del repositorio.*  
*Última actualización: 2026-04-01 — Revisión manual recomendada antes de uso en documento oficial.*
