# MAPA DE NAVEGACIÓN DEL SISTEMA
## Sistema de Control de Acceso, Gestión de Fichas y Equipos SENA

**Versión:** 1.0  
**Fecha de extracción:** 2026-04-01  
**Método:** Ingeniería Inversa — `App.tsx`, Layouts, Sidebars y `DocumentTitleUpdater.tsx`

---

## Resumen de Arquitectura de Navegación

| Componente | Layout Wrapper | Sidebar | Header | Guardia de Rol |
| :--- | :--- | :--- | :--- | :--- |
| SuperAdmin | `ProtectedRoute` → `DashboardLayout` | `Sidebar.tsx` (modo `superadmin`) | `Header.tsx` | `authToken` en sessionStorage |
| Admin de Entidad | `NormalAdminLayout` | `NormalAdminSidebar.tsx` (rol `1`) | `NormalAdminHeader.tsx` | `id_rol === 1` |
| Control Personas | `PuertasLayout` | `NormalAdminSidebar.tsx` (rol `3`) | `NormalAdminHeader.tsx` | `id_rol === 3` |
| Control Vehículos | `PuertasLayout` | `NormalAdminSidebar.tsx` (rol `4`) | `NormalAdminHeader.tsx` | `id_rol === 4` |
| Usuario Regular | `UserLayout` | `UserSidebar.tsx` | `UserHeader.tsx` | `id_rol === 2` |
| Instructor (add-on) | `UserLayout` | `UserSidebar.tsx` (sección condicional) | `UserHeader.tsx` | `id_rol === 2` + `es_instructor === true` |

---

## Roles del Sistema

| `id_rol` | Nombre | Descripción |
| :--- | :--- | :--- |
| — | SuperAdministrador | Modelo `Admins`, tabla independiente. Login propio. |
| 1 | Administrador Normal (Entidad) | Admin que gestiona una entidad SENA. |
| 2 | Usuario Regular | Aprendiz, administrativo, o cualquier persona registrada. |
| 3 | Control de Personas (Portería) | Operador en punto de ingreso peatonal. |
| 4 | Control de Vehículos (Portería) | Operador en punto de ingreso vehicular. |

> **Nota:** Los roles 3 y 4 comparten el `NormalAdminLogin` (`/login`) como punto de entrada, pero el `Dashboard.tsx` los redirige automáticamente a sus respectivas vistas de portería.

---

## Rutas Públicas (Sin Autenticación)

Estas rutas son accesibles por cualquier visitante sin necesidad de iniciar sesión.

* **Página de Inicio** (`/`)
  * Landing page pública del sistema. Presentación general de la plataforma.
  * *Tab del navegador:* `Inicio | SENA`

* **Planes de Licencia** (`/plans`)
  * Catálogo público de los planes de licenciamiento disponibles.
  * *Tab del navegador:* `Planes de Licencia | SENA`

* **Iniciar Sesión — Admin / Portería** (`/login`)
  * Formulario de login para roles 1, 3 y 4. Genera token Sanctum.
  * *Tab del navegador:* `Iniciar Sesión | SENA`

* **Iniciar Sesión — Super Admin** (`/superadmin/login`)
  * Formulario de login exclusivo del SuperAdministrador. Genera token Sanctum aparte.
  * *Tab del navegador:* `Login Super Admin | SENA`

* **Recuperar Contraseña** (`/forgot-password`)
  * Formulario para solicitar código de recuperación vía correo electrónico.
  * *Tab del navegador:* `Recuperar Contraseña | SENA`

* **Verificar Código** (`/verify-code`)
  * Formulario para ingresar el código temporal recibido por correo.
  * *Tab del navegador:* `Verificar Código | SENA`

* **Restablecer Contraseña** (`/reset-password`)
  * Formulario para establecer la nueva contraseña tras verificar el código.
  * *Tab del navegador:* `Restablecer Contraseña | SENA`

* **Registrar Entidad** (`/register-entity`)
  * Paso 1 del flujo de registro: crear la entidad (NIT, nombre, dirección).
  * *Tab del navegador:* `Registrar Entidad | SENA`

* **Registrar Administrador** (`/register-admin`)
  * Paso 2 del flujo de registro: crear el usuario administrador de la entidad.
  * *Tab del navegador:* `Registrar Administrador | SENA`

* **Registro de Usuario (QR)** (`/register-user`)
  * Formulario público para que usuarios regulares se auto-registren (accesible vía QR).
  * *Tab del navegador:* `Registrar Usuario | SENA`

---

## 1. Perfil: SuperAdministrador

> **Guardia:** `ProtectedRoute` — requiere `authToken` en `sessionStorage`. Redirige a `/superadmin/login` si falta.  
> **Layout:** Cada vista usa `Sidebar.tsx` (modo `superadmin`) + `Header.tsx` embebidos directamente.

* **Panel** (`/superadmin/dashboard`)
  * Dashboard principal: tarjetas de estadísticas (Instituciones Activas, Licencias por Expirar, Ingresos Mensuales).
  * Tabla paginada de todas las licencias del sistema con filtros por entidad, estado y plan.
  * *Acciones secundarias:* Cambiar estado de licencia inline (Activar/Desactivar).
  * *Tab del navegador:* `Panel Super Admin | SENA`

* **Administradores** (`/superadmin/admins`)
  * CRUD completo de los usuarios `Admins` (SuperAdministradores del sistema).
  * *Acciones secundarias:* Modal de creación de nuevo admin, edición inline, eliminación.
  * *Tab del navegador:* `Administradores | SENA`

* **Instituciones** (`/superadmin/institutions`)
  * CRUD de Entidades/Instituciones registradas en la plataforma.
  * *Acciones secundarias:* Modal de creación/edición de entidad, eliminación, detalle.
  * *Tab del navegador:* `Instituciones | SENA`

* **Admin Entidades** (`/superadmin/entities-admins`)
  * Lista de todas las entidades con acceso rápido para ver los administradores de cada una.
  * *Tab del navegador:* `Entidades Admin | SENA`

  * **Admins de Entidad** (`/superadmin/entities-admins/:nit`)
    * Detalle: lista de administradores vinculados a una entidad específica (por NIT).
    * *Tab del navegador:* `Admins de Entidad | SENA`

* **Planes de Licencia** (`/superadmin/license-plans`)
  * CRUD de los planes de licenciamiento (nombre, precio, duración, características).
  * *Acciones secundarias:* Modal de creación de plan, edición, eliminación.
  * *Tab del navegador:* `Planes de Licencia | SENA`

* **Reportes** (`/superadmin/reports`)
  * Generación y descarga de reportes globales: licencias, entidades, detalle por entidad.
  * *Acciones secundarias:* Descarga de PDF/Excel.
  * *Tab del navegador:* `Reportes | SENA`

---

## 2. Perfil: Administrador de Entidad (Normal Admin — `id_rol: 1`)

> **Guardia:** `NormalAdminLayout` — requiere `authUser` en `sessionStorage` con `id_rol !== 2`. Si rol es 2, redirige a `/user/dashboard`. Si rol es 3, redirige a `/puertas/personas`. Si rol es 4, redirige a `/puertas/vehiculos`.  
> **Layout:** `NormalAdminSidebar.tsx` (ítems de menú condicionales por rol) + `NormalAdminHeader.tsx`.

### Items principales del sidebar

* **Panel** (`/dashboard`)
  * Dashboard del administrador: tarjetas de estadísticas (Usuarios Activos, Accesos Diarios, Estado de Licencia).
  * Sección de información de la entidad (NIT, nombre, dirección, vencimiento de licencia, plan actual).
  * *Acciones secundarias:* Modal de licencia expirada (`ExpirationModal`), Botón "Cargar Pago" si licencia pendiente.
  * *Tab del navegador:* `Panel Principal | SENA`

* **Registro Completo** (`/user/normaladmin/registro-personas`)
  * Vista completa para consultar y registrar personas de la entidad.
  * *Tab del navegador:* `Registro Personas | SENA`

* **Aprobaciones** (`/user/normaladmin/aprobaciones`)
  * Cola de aprobación de activos pendientes (vehículos y equipos propios registrados por usuarios regulares).
  * *Acciones secundarias:* Aprobar (activar) o Rechazar (inactivar) cada activo.
  * *Tab del navegador:* `Aprobaciones | SENA`

### Accordeón: 📁 Fichas

* **Crear Ficha** (`/user/normaladmin/fichas/crear`)
  * Formulario para crear una nueva ficha de formación (número, programa, ambiente, jornada).
  * *Tab del navegador:* `Crear Ficha | SENA`

* **Asignar Usuarios** (`/user/normaladmin/fichas/asignar`)
  * Tablero Drag & Drop de dos columnas: usuarios disponibles ↔ ficha seleccionada.
  * Incluye buscador/filtro, combo box para buscar ficha por número, selector de ambiente.
  * Badge "Instructor previo" (amarillo) para usuarios que ya son instructor en otra ficha.
  * Badge "🏢 Área" (índigo) para personal administrativo, empujados al fondo de la lista.
  * *Tab del navegador:* `Asignar Ficha | SENA`

* **Listar y Gestionar** (`/user/normaladmin/fichas/lista`)
  * Tabla de todas las fichas con: número, programa, ambiente, jornada, conteo de usuarios, estado.
  * *Acciones secundarias:* Cambiar estado (Lectiva/Productiva/Finalizada), ver detalle de usuarios, cambiar rol de participante (aprendiz ↔ instructor), desvincular usuario, editar hora límite de llegada.
  * *Tab del navegador:* `Lista Fichas | SENA`

* **Gestión de Áreas** (`/user/normaladmin/fichas/areas`) *(no aparece en el sidebar actual, pero la ruta está registrada)*
  * Vista para crear áreas administrativas y asignar personal no-ficha mediante Drag & Drop.
  * Pills de áreas, formulario de creación inline, tablero de dos columnas.
  * *Tab del navegador:* `SENA` (fallback, sin título específico registrado)

### Accordeón: 📁 Equipos

* **Registrar Equipos** (`/user/normaladmin/equipos/registrar`)
  * Formulario de registro manual de equipos institucionales SENA (serial, marca, SO, categoría).
  * *Tab del navegador:* `Registrar Equipos | SENA`

* **Asignar Equipos** (`/user/normaladmin/equipos/asignar`)
  * Vista de asignación masiva: selección de ficha y lote → botón de asignación automática.
  * Dos tablas: Integrantes de la ficha (con estado de equipo) y Equipos del lote.
  * *Acciones secundarias:* Modales de detalle de usuario (`UserDetailModal`) y de equipo (`EquipmentDetailModal`), cambio de ambiente de la ficha (mudanza).
  * *Tab del navegador:* `Asignar Equipos | SENA`

* **Historial de Asignaciones** (`/user/normaladmin/equipos/historial`)
  * Historial de todas las asignaciones masivas ejecutadas, agrupadas por `codigo_asignacion`.
  * *Tab del navegador:* `Historial Equipos | SENA`

* **Gestión de Lotes** (`/user/normaladmin/equipos/gestion-lotes`)
  * Lista de lotes con conteo de equipos. Selector de lote para ver equipos agrupados.
  * Importación CSV de equipos (formulario de carga de archivo).
  * Selector de ambiente para vincular un lote a un aula física.
  * *Acciones secundarias:* Renombrar lote, mover equipo individual entre lotes.
  * *Tab del navegador:* `Gestión Lotes | SENA`

### Accordeón: 📁 Reportes

* **Reporte por Persona** (`/user/normaladmin/reportes/persona`)
  * Consulta del historial de accesos de cualquier usuario de la entidad, filtrado por documento.
  * *Tab del navegador:* `Reportes Persona | SENA`

* **Reporte del Día** (`/user/normaladmin/reportes/diario`)
  * Resumen del flujo de personas y equipos para un día específico, con filtros de fecha.
  * *Tab del navegador:* `Reporte Diario | SENA`

### Accordeón: 📁 Otros (Tablas Dinámicas)

* **{nombre_tabla}** (`/user/normaladmin/tables/:tableName`)
  * CRUD dinámico auto-generado para tablas de catálogo del sistema (ej. `marcas_equipo`, `tipos_vehiculo`, `programas`, `ambientes`, `jornadas`, etc.).
  * Los ítems del submenú se poblan dinámicamente al cargar el sidebar vía `GET /tablas-cortas`.
  * *Tab del navegador:* `Gestión de Tabla | SENA`

### Rutas adicionales (sin item de sidebar)

* **Pago de Licencia** (`/license-payment`)
  * Vista de integración con Stripe para procesamiento de pago de licencia.
  * *Tab del navegador:* `Pago de Licencia | SENA`

* **Pago Exitoso** (`/payment-success`)
  * Pantalla de confirmación al retornar de Stripe tras pago aprobado.
  * *Tab del navegador:* `Pago Exitoso | SENA`

* **Pago Cancelado** (`/payment-cancel`)
  * Pantalla informativa al cancelar el pago en Stripe.
  * *Tab del navegador:* `Pago Cancelado | SENA`

---

## 3. Perfil: Personal de Portería — Control de Personas (`id_rol: 3`)

> **Guardia:** `PuertasLayout` — requiere `authUser` en `sessionStorage` con `id_rol === 3` o `id_rol === 4`. Redirige a `/login` si falla.  
> **Layout:** `NormalAdminSidebar.tsx` (renderiza solo "Control Personas" como item) + `NormalAdminHeader.tsx`.  
> **Logo del sidebar:** `CP` — "Control Personas"

* **Control Personas** (`/puertas/personas`)
  * Dashboard de portería: barra de búsqueda por documento.
  * Muestra datos del usuario encontrado, sus equipos propios activos, y estado "adentro/afuera".
  * Pre-selección automática de equipos (checkbox marcados con los equipos del registro abierto).
  * Lógica de doble escaneo: primer escaneo busca, segundo escaneo confirma la acción.
  * *Acciones:* Registrar Entrada (con selección de equipos), Registrar Salida.
  * *Tab del navegador:* `Control Personas | SENA`

---

## 4. Perfil: Personal de Portería — Control de Vehículos (`id_rol: 4`)

> **Guardia:** `PuertasLayout` — requiere `id_rol === 3` o `id_rol === 4`.  
> **Layout:** `NormalAdminSidebar.tsx` (renderiza solo "Control Vehículos" como item) + `NormalAdminHeader.tsx`.  
> **Logo del sidebar:** `CV` — "Control Vehículos"

* **Control Vehículos** (`/puertas/vehiculos`)
  * Dashboard de portería vehicular: barra de búsqueda por placa o documento del propietario.
  * Muestra vehículos activos del usuario, tipo de vehículo, equipos de cómputo asociados.
  * Detalle de registros abiertos (vehículos que ya ingresaron).
  * *Acciones:* Registrar Entrada de vehículo, Registrar Salida de vehículo.
  * *Tab del navegador:* `Control Vehículos | SENA`

---

## 5. Perfil: Usuario Regular — Aprendiz / Administrativo (`id_rol: 2`)

> **Guardia:** `UserLayout` — requiere `authToken` y `authUser` con `id_rol === 2`. Redirige al inicio (`/`) si falla.  
> **Layout:** `UserSidebar.tsx` + `UserHeader.tsx`.  
> **Logo del sidebar:** `US` — "Usuario"

### Items fijos del sidebar

* **Mi Panel** (`/user/dashboard`)
  * Dashboard personal del usuario: vehículos registrados, equipos asignados, últimas entradas.
  * Formularios de registro de vehículo (con OCR de placa) y equipo propio (con OCR de serial).
  * Toggle para activar/inactivar activos, establecer activo predeterminado.
  * Alerta de sesión prolongada (>6.5 horas adentro).
  * *Tab del navegador:* `Panel de Usuario | SENA`

* **Historial** (`/user/historial`)
  * Tabla de todos los registros de entrada/salida del usuario, con filtro por fecha.
  * Detalle por registro: fecha, hora de entrada, hora de salida, placa, equipos.
  * *Acciones secundarias:* Exportar historial como PDF.
  * *Tab del navegador:* `Historial | SENA`

* **Mi Código** (`/user/codigo`)
  * Muestra el código de barras personal del usuario en formato visual (Base64).
  * El usuario puede presentar esta pantalla en los puntos de control para agilizar su identificación.
  * *Tab del navegador:* `Mi Código | SENA`

---

## 6. Perfil: Instructor (Add-on sobre Usuario Regular — `id_rol: 2` + `es_instructor: true`)

> **Guardia:** Mismo `UserLayout` que el usuario regular. La sección "Instructor" aparece condicionalmente en el sidebar solo si `user.es_instructor === true` (verificado en `UserSidebar.tsx`).  
> **Layout:** `UserSidebar.tsx` (sección accordeón extra "Instructor") + `UserHeader.tsx`.

### Accordeón condicional: 📁 Instructor

* **Equipos Asignados** (`/user/instructor/equipos`)
  * Tabla de los equipos SENA asignados a los aprendices de su ficha (documento, nombre, serial, placa, modelo).
  * Permite al instructor ver rápidamente qué equipo tiene cada aprendiz.
  * *Tab del navegador:* `Equipos Asignados | SENA`

* **Asistencia de Ficha** (`/user/instructor/asistencia`)
  * Tabla de asistencia mensual tipo calendario: cada aprendiz × cada día del mes.
  * Filtro por mes/año. Selector de ficha si el instructor tiene múltiples fichas.
  * Indicador visual de puntualidad basado en `hora_limite_llegada` de la ficha.
  * Configuración de la hora límite desde esta misma vista.
  * *Tab del navegador:* `Asistencia | SENA`

> **Nota:** El instructor conserva acceso completo a todas las vistas del "Usuario Regular" (Mi Panel, Historial, Mi Código). Las vistas de instructor son un **complemento**, no un reemplazo.

---

## Redirects Automáticos

| Ruta origen | Ruta destino | Descripción |
| :--- | :--- | :--- |
| `/user/normaladmin/dashboard` | `/dashboard` | Alias de conveniencia |
| `/normaladmin/login` | `/login` | Redirect legacy |
| `/normaladmin/dashboard` | `/dashboard` | Redirect legacy |

---

## Diagrama de Flujo de Autenticación y Despacho por Rol

```
   /login  (formulario compartido, roles 1, 3, 4)
      │
      ▼
  Backend Sanctum  →  Token + authUser.id_rol
      │
      ├── id_rol === 1  →  /dashboard              (Admin de Entidad)
      ├── id_rol === 3  →  /puertas/personas        (Portería Personas)
      └── id_rol === 4  →  /puertas/vehiculos       (Portería Vehículos)

   /register-user  (formulario QR, solo rol 2)
      │
      ▼
  Backend Sanctum  →  Token + authUser.id_rol === 2
      │
      └── id_rol === 2  →  /user/dashboard          (Usuario Regular)
```

---

*Documento generado automáticamente mediante ingeniería inversa del código frontend del repositorio.*  
*Última actualización: 2026-04-01 — Revisión manual recomendada antes de uso en documento oficial.*
