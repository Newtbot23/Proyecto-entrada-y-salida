# Documentación Técnica del Frontend - Proyecto Formativo

## 1. Visión General
Este documento detalla la arquitectura, estructura y componentes del frontend de la aplicación. El proyecto está construido utilizando **React** con **TypeScript** y emplea **CSS Modules** para la gestión de estilos, asegurando un código modular, tipado seguro y escalable.

El objetivo principal de esta interfaz es proporcionar un panel de control administrativo (Super Admin Dashboard) para la gestión de instituciones, licencias y visualización de reportes.

---

## 2. Stack Tecnológico

- **Framework**: React 18+
- **Lenguaje**: TypeScript
- **Enrutamiento**: React Router v6
- **Estilos**: CSS Modules (`.module.css`)
- **Empaquetador**: Vite (inferido por el script `dev`)
- **Iconos**: SVG Components personalizados (`src/components/common/Icons.tsx`)

---

## 3. Estructura de Directorios

La estructura del directorio `src` sigue una arquitectura basada en características y dominios:

```
src/
├── components/          # Componentes de UI reutilizables
│   ├── common/          # Elementos atómicos (Botones, Inputs, Iconos)
│   ├── layout/          # Estructura principal (Sidebar, Header)
│   ├── dashboard/       # Widgets específicos del dashboard (StatCard, LicenseTable)
│   ├── modals/          # Modales para formularios y detalles
│   └── reports/         # Componentes de la vista de reportes (Filtros, Gráficos)
│
├── pages/               # Vistas principales (Rutas)
│   ├── superadmin/      # Vistas del módulo de Super Admin
│   └── Plans/           # Vistas públicas de planes
│
├── services/            # Capa de comunicación con el Backend (API)
│   ├── institutionService.ts
│   ├── licensePlanService.ts
│   └── reportService.ts
│
├── types/               # Definiciones de tipos TypeScript (DTOs)
│   ├── institution.ts
│   ├── licensePlan.ts
│   └── report.ts
│
├── hooks/               # Hooks personalizados (e.g., useDebounce)
├── App.tsx              # Configuración de rutas principales
└── main.tsx             # Punto de entrada de la aplicación
```

---

## 4. Módulos y Funcionalidades Principales

### 4.1. Módulo Super Admin (`src/pages/superadmin/`)

Este es el núcleo de la aplicación administrativa. Incluye:

1.  **Dashboard (`MainPageDashborad.tsx`)**:
    - Vista general con tarjetas de estadísticas (`StatCard`).
    - Tabla de actividades recientes de licencias (`LicenseTable`).
    
2.  **Gestión de Instituciones (`InstitutionsPage.tsx`)**:
    - Listado de instituciones con filtros y búsqueda.
    - Creación y edición mediante modales (`InstitutionFormModal`).
    - Validación estricta de formularios (NIT inmutable, ID solo lectura).
    - Detalle de institución (`InstitutionDetailsPage`) y modal de vista rápida.

3.  **Gestión de Planes de Licencia (`LicensePlansPage.tsx`)**:
    - Administración de los tipos de planes disponibles.
    - Operaciones CRUD completas.

4.  **Reportes y Analítica (`ReportsPage.tsx`)**:
    - Visualización de datos clave: Ingresos, Ventas de Licencias, Crecimiento.
    - Filtros avanzados: Rango de fechas, Institución, Tipo de Licencia.
    - Funcionalidad de exportación (CSV, PDF).

### 4.2. Sistema de Diseño y Componentes UI

La UI se construye a partir de componentes modulares ubicados en `src/components/common`:

- **Layout**: `Sidebar` (colapsable) y `Header` proporcionan la estructura base para todas las páginas administrativas.
- **Icons**: Sistema centralizado de iconos SVG para mantener consistencia visual.
- **Modales**: Sistema flexible de ventanas emergentes para formularios y confirmaciones (`Modal.tsx`, `ConfirmationModal.tsx`).
- **Tablas y Listas**: Componentes estilizados para mostrar grandes volúmenes de datos con paginación (`Pagination.tsx`).

---

## 5. Arquitectura de Datos y Servicios

El frontend utiliza una **Capa de Servicios** para desacoplar la lógica de vista de la lógica de datos. Todos los servicios se encuentran en `src/services/`.

### Patrón de Servicios
Cada servicio exporta funciones asíncronas que simulan (o realizan) peticiones HTTP. Actualmente están configurados con datos simulados (mocks) pero listos para integración con Laravel.

Ejemplo (`institutionService.ts`):
- `getInstitutions(filters, page)`: Obtiene lista paginada.
- `createInstitution(data)`: Envía POST para crear.
- `updateInstitution(id, data)`: Envía PUT para actualizar.

### Tipos y DTOs
Todas las entidades están fuertemente tipadas en `src/types/`. Esto asegura que los datos del frontend coincidan estrictamente con el esquema de base de datos de Laravel.

- **Institution**: Sincronizado con la tabla `entidades` (`nombre_entidad`, `nit`, `correo`, etc.).
- **ReportData**: Define la estructura para gráficos de analítica.

---

## 6. Integración con Backend (Laravel)

El proyecto está preparado para conectarse a una API RESTful de Laravel.

### Puntos de Integración Clave:
1.  **Endpoints**: Los servicios (`src/services/*.ts`) contienen comentarios TODO con las rutas de API esperadas (e.g., `/api/superadmin/entidades`).
2.  **Mapeo de Campos**: El frontend ya utiliza los nombres de columna de la base de datos (snake_case para campos como `nombre_entidad`, `created_at`), facilitando el mapeo directo de las respuestas JSON.
3.  **Autenticación**: Se requiere implementar el envío de tokens (Bearer Token) en los headers de las peticiones dentro de los archivos de servicio.

---

## 7. Guía de Desarrollo

### Agregar una Nueva Página
1.  Crear el componente en `src/pages/superadmin/`.
2.  Definir la ruta en `src/App.tsx`.
3.  Agregar el enlace en el menú lateral `src/components/layout/Sidebar.tsx`.

### Conectar a la API Real
1.  Ir al servicio correspondiente en `src/services/`.
2.  Reemplazar el código de mock (`setTimeout`, arrays locales) con `fetch` o `axios`.
3.  Manejar las respuestas y errores según los códigos de estado HTTP.
