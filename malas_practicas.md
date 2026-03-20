# 🚨 Reporte de Malas Prácticas — Proyecto Entrada y Salida

> **Generado el:** 2026-03-20  
> **Alcance:** Frontend (React + TypeScript) · Backend (Laravel API)  
> **Metodología:** Análisis estático de código con búsqueda por patrones

---

## Resumen Ejecutivo

| Categoría | Severidad | Archivos afectados |
|---|---|---|
| Estilos inline masivos | 🔴 Alta | `UserHistory.tsx`, `UserDashboard.tsx`, `Register.tsx` + más |
| `fetch()` directo sin pasar por `api.ts` | 🔴 Alta | 5 archivos |
| Ausencia total de TanStack Query | 🟠 Media-Alta | Todo el proyecto |
| Tipado débil — uso excesivo de `any` | 🟠 Media-Alta | +10 archivos de servicios/páginas |
| `DB::table` en lugar de Eloquent | 🟠 Media | 6 controladores |
| Controladores demasiado grandes | 🟠 Media | `UserDashboardController`, `FichaController`, `UsuariosController` |
| Lógica duplicada en controladores | 🟠 Media | `UserDashboardController`, `UsuariosController` |
| `env()` directo en controladores | 🟡 Baja-Media | 3 controladores |
| `useEffect` para fetch sin cache | 🟡 Baja-Media | Todos los componentes con datos |
| `planService.ts` usa `fetch` crudo | 🔴 Alta | `planService.ts` |

---

## 🖥️ FRONTEND — Malas Prácticas

---

### 1. 🔴 Estilos Inline Masivos (`style={{ ... }}`)

**Descripción:** El proyecto usa `style={{ }}` extensivamente en JSX, lo cual viola la separación de responsabilidades entre estructura y presentación, hace que los estilos sean no-reutilizables, y genera bloat en cada renderizado.

**Archivos afectados:**

#### `UserHistory.tsx` (~30 instancias)
```tsx
// ❌ MAL — hardcoded colors, spacing y layout mezclados en el JSX
<div className="history-root" style={{ marginTop: '1rem', paddingBottom: '3rem', width: '100%', flex: 1 }}>
<h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
<td style={{ ...thTdStyle, color: '#10b981', fontWeight: '500' }}>{ent.hora_entrada}</td>
<tr style={{ transition: 'background 0.1s' }} onMouseOver={ev => ev.currentTarget.style.background = '#f9fafb'}>
```

#### `UserDashboard.tsx` (~20 instancias)
```tsx
// ❌ MAL — lógica de hover en manejadores de eventos inline
<h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#111827', marginBottom: '1.5rem' }}>
<h4 style={{ margin: 0, color: '#9a3412', fontWeight: '700', fontSize: '1.05rem' }}>
<div className="user-data-container" style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
```

#### `Register.tsx` (~12 instancias)
```tsx
// ❌ MAL — colores hardcodeados sin usar CSS variables ni clases
{error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
<a href="/login" style={{ color: '#008f39', fontSize: '0.875rem', fontWeight: 'bold' }}>
```

**✅ Solución:** Mover todos los estilos a los módulos CSS correspondientes (`.module.css`) o definir variables CSS reutilizables. Los hovers deben manejarse con `:hover` en CSS.

---

### 2. 🔴 `fetch()` Directo Saltándose `api.ts` y los Servicios

**Descripción:** El proyecto tiene un `api.ts` centralizado con autenticación y manejo de errores, pero varias páginas y un servicio lo ignoran por completo, haciendo llamadas HTTP crudas. Esto rompe la capa de abstracción, duplica el manejo del token, y hace el código difícil de mantener.

#### `UserDashboard.tsx` — **4 fetches directos en la misma página**
```tsx
// ❌ MAL — la URL, el token y el manejo de errores se repiten manualmente en cada función
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'; // ← repetido 4 veces

const res = await fetch(`${apiUrl}/user/vehiculos`, {
    headers: { 'Authorization': `Bearer ${token}` }
});
const res = await fetch(`${apiUrl}/ocr/read-plate`, { ... });
const res = await fetch(`${apiUrl}/ocr/read-serial`, { ... });
const res = await fetch(`${apiUrl}/user/equipos`, { ... });
```
> Para `/user/vehiculos` y `/user/equipos` ya existen funciones en `userDashboardService.ts`. Se están ignorando.

#### `UserHistory.tsx` — **2 fetches directos**
```tsx
// ❌ MAL — la URL base se reconstruye dentro de cada handler
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const res = await fetch(url, { headers }); // fetch crudo sin abstracción
```

#### `AprobacionesActivos.tsx` — **2 fetches directos**
```tsx
// ❌ MAL — no existe servicio para este módulo, y la autenticación se maneja manualmente
const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/activos-pendientes`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
});
const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/activos/${tipo}/${id}/estado`, { ... });
```

#### `InstitutionsPage.tsx` — **1 fetch directo**
```tsx
// ❌ MAL — se usa fetch directamente en lugar del servicio de instituciones
const response = await fetch(url, { ... });
```

#### `planService.ts` — **fetch crudo dentro de un archivo de servicios**
```tsx
// ❌ MAL — un *servicio* que debería usar apiClient hace fetch directo
const response = await fetch(`${API_URL}/plans`);
const response = await fetch(`${API_URL}/plans/select`, { method: 'POST', ... });
```

**✅ Solución:** Todos los servicios deben importar y usar `apiClient` de `config/api.ts`. Los `fetch()` crudos deben eliminarse completamente de los componentes — si no existe el método en el servicio, crearlo.

---

### 3. 🟠 Ausencia Total de TanStack Query (React Query)

**Descripción:** El proyecto no usa TanStack Query (`useQuery`, `useMutation`, `useInfiniteQuery`) en absolutamente ningún componente. Toda la obtención de datos se hace con el patrón `useEffect + useState`, lo que implica:
- No hay caché de datos entre navegaciones
- No hay stale-while-revalidate (el usuario siempre ve pantallas en blanco)
- Los estados de loading/error se definen manualmente en cada página
- Al volver a una página, los datos se vuelven a pedir aunque no hayan cambiado
- No hay invalidación de caché tras mutaciones

**Patrón repetido en TODOS los componentes:**
```tsx
// ❌ MAL — este patrón aparece en más de 15 componentes
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await someService.getData();
            setData(result);
        } catch (err) {
            setError('Error al cargar');
        } finally {
            setLoading(false);
        }
    };
    fetchData();
}, []);
```

**Archivos afectados:** `Dashboard.tsx`, `FichasList.tsx`, `FichasAssign.tsx`, `AprobacionesActivos.tsx`, `UserHistory.tsx`, `UserDashboard.tsx`, `ReporteDiario.tsx`, `AsistenciaFicha.tsx`, `ReportsPage.tsx`, `AdminEntitiesPage.tsx`, `InstitutionDetailsPage.tsx`, y más.

**✅ Solución:** Adoptar TanStack Query. El `queryFn` debe llamar al servicio correspondiente. Ejemplo:
```tsx
// ✅ BIEN
const { data, isLoading, error } = useQuery({
    queryKey: ['fichas'],
    queryFn: fichasService.getFichas,
});

const mutation = useMutation({
    mutationFn: fichasService.createFicha,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fichas'] }),
});
```

---

### 4. 🟠 Tipado Débil — Uso Excesivo de `any`

**Descripción:** El TypeScript de los servicios y algunos componentes hace un uso excesivo de `any`, perdiendo los beneficios del tipado estático y del autocompletado del IDE.

**Archivos afectados:**

| Archivo | Ejemplos de `any` |
|---|---|
| `registrationService.ts` | `createEntity(entityData: any)`, `fullRegistration(allData: any)`, `registerUser(userData: any)` |
| `fichasService.ts` | `createFicha(data: any): Promise<any>`, `getFichaUsuarios(): Promise<any>`, `getUsuariosAsignables(): Promise<any[]>` |
| `userDashboardService.ts` | `getTiposDoc(): Promise<any[]>`, `setDefaultAsset(): Promise<any>`, `toggleAssetStatus(): Promise<any>` |
| `equiposService.ts` | `getLotes(): Promise<any[]>`, `renombrarLote(): Promise<any>`, `moverEquipoLote(): Promise<any>` |
| `reportService.ts` | `api.get<any>(...)` en múltiples funciones |
| `licensePlanService.ts` | `apiClient.post<any, any>(...)`, `apiClient.put<any, any>(...)` |

```tsx
// ❌ MAL — pérdida total de tipado
export const registerUser = async (userData: any) => { ... }
const response = await apiClient.post<any, any>('/registration/usuarios', userData);
```

**✅ Solución:** Definir interfaces/tipos en la carpeta `types/` para todos los objetos de dominio (`Usuario`, `Ficha`, `Equipo`, `Vehiculo`, etc.) y reemplazar `any` con esos tipos específicos.

---

### 5. 🟡 `useEffect` para Fetch sin Cleanup ni Dependencias Correctas

**Descripción:** Muchos `useEffect` que hacen fetch no incluyen función de cleanup (para cancelar la petición si el componente se desmonta), y algunos tienen arrays de dependencias vacíos que ocultan posibles comportamientos desactualizados.

```tsx
// ❌ MAL — sin AbortController ni cleanup, si el componente se desmonta antes del fetch,
// se intenta hacer setState en un componente unmounted
useEffect(() => {
    const fetchData = async () => {
        const result = await service.getData();
        setData(result); // ← puede llamarse después del desmontaje
    };
    fetchData();
}, []); // ← array vacío, nunca se re-ejecuta aunque cambien las dependencias reales
```

**Archivos afectados:** `Dashboard.tsx`, `FichasList.tsx`, `ReporteDiario.tsx`, `GestionLotes.tsx`, `AsistenciaFicha.tsx`, y más.

---

### 6. 🟡 Archivos de Páginas Sobredimensionados

**Descripción:** Varias páginas mezclan lógica de negocio, estado, llamadas HTTP y render en un único archivo, haciendo el código difícil de mantener.

| Archivo | Tamaño (bytes) | Problema |
|---|---|---|
| `InstitutionsPage.tsx` | 29,597 | Fetch directo + lógica de CRUD completa + render |
| `VehiculosDashboard.tsx` | 19,658 | Toda la lógica de vehículos + modales + validaciones |
| `ReportePersona.tsx` | 13,986 | Generación de reportes + tablas complejas |
| `ReporteDiario.tsx` | 11,157 | Lógica de filtros + render |
| `UserDashboard.tsx` | ~600+ líneas | 4 fetch directos + lógica OCR + lógica de UI |

**✅ Solución:** Extraer lógica reutilizable en custom hooks (`useVehiculos`, `useEquipos`, `useFichas`), y dividir componentes complejos en componentes hijos más pequeños.

---

## ⚙️ BACKEND — Malas Prácticas

---

### 7. 🟠 Controladores Demasiado Grandes (Fat Controllers)

**Descripción:** Varios controladores acumulan demasiada lógica directamente, violando el principio de Responsabilidad Única y el patrón de repositorio/servicio de Laravel.

| Controlador | Líneas | Métodos |
|---|---|---|
| `UserDashboardController.php` | **595** | OCR para placas, OCR para seriales, CRUD vehículos, CRUD equipos, asignaciones, sesión activa |
| `FichaController.php` | **581** | CRUD fichas, asignación usuarios, roles, asistencia mensual desde dos roles distintos |
| `UsuariosController.php` | 378+ | Generación QR, OCR, activación, CRUD usuarios |
| `DynamicTableController.php` | 400+ | Reflexión de tablas DB, CRUD dinámico |

**✅ Solución:** Extraer la lógica de negocio a clases de Servicio en `App\Services\`. Por ejemplo:
```php
// ✅ BIEN — separar OCR en su propio servicio
class GoogleVisionService {
    public function readPlate(string $base64Image): ?string { ... }
    public function readSerial(string $base64Image): ?string { ... }
}

// El controlador solo orquesta
public function readPlate(Request $request) {
    $placa = app(GoogleVisionService::class)->readPlate($base64);
    return response()->json(['placa' => $placa]);
}
```

---

### 8. 🟠 Lógica Duplicada — OCR en Dos Controladores

**Descripción:** La lógica de llamada a Google Vision API está **duplicada exactamente** en dos controladores distintos:

- `UserDashboardController.php` → `readPlate()` (líneas 121–210) y `readSerial()` (líneas 212–287)
- `UsuariosController.php` → lógica OCR similar (línea 163)

Los métodos `readPlate` y `readSerial` en `UserDashboardController` son prácticamente idénticos estructuralmente (misma petición HTTP, mismo manejo de errores, misma construcción de payload), diferenciándose solo en el regex de extracción.

**✅ Solución:** Crear `App\Services\GoogleVisionService` con un método genérico `extractText(string $base64): ?string` y métodos específicos `parsePlate()` y `parseSerial()` que envuelvan la lógica de regex.

---

### 9. 🟠 Uso de `DB::table()` en Lugar de Eloquent

**Descripción:** Múltiples controladores hacen consultas con el Query Builder crudo (`DB::table()`), saltándose los modelos Eloquent. Esto pierde las ventajas de los modelos (accessors, mutators, relaciones, eventos, scopes).

**Controladores afectados:**

| Controlador | Tablas consultadas directamente |
|---|---|
| `UserDashboardController.php` | `vehiculos`, `equipos`, `asignaciones`, `tipos_vehiculo`, `marcas_equipo`, `sistemas_operativos` |
| `FichaController.php` | `detalle_ficha_usuarios`, `programas`, `ambientes`, `jornadas` |
| `PuertasController.php` | `usuarios`, `vehiculos`, `equipos`, `registros`, `registros_equipos` |
| `EquipoController.php` | `equipos`, `marcas_equipo`, `sistemas_operativos` |
| `ReportController.php` | `usuarios`, `registros`, `registros_equipos` |
| `PasswordRecoveryApiController.php` | `password_reset_codes` |

```php
// ❌ MAL — DB::table crudo ignora el modelo y sus relaciones
$vehiculos = DB::table('vehiculos')
    ->join('tipos_vehiculo', 'vehiculos.id_tipo_vehiculo', '=', 'tipos_vehiculo.id')
    ->where('vehiculos.doc', $user->doc)
    ->get();

// ✅ BIEN — usando el modelo con Eager Loading
$vehiculos = Vehiculos::with('tipoVehiculo')
    ->where('doc', $user->doc)
    ->get();
```

---

### 10. 🟠 Ausencia de Form Requests para Validación

**Descripción:** Las validaciones se hacen con `$request->validate()` directamente en los métodos del controlador, mezclando responsabilidades. Para formularios complejos, esto hace los controladores más largos y la lógica de validación no es reutilizable.

```php
// ❌ MAL — validación de 8 campos dentro del método del controlador
public function storeVehiculo(Request $request) {
    $request->validate([
        'placa' => 'required|string|max:10|unique:vehiculos,placa',
        'id_tipo_vehiculo' => 'required|integer',
        'marca' => 'required|string|max:100',
        // ...
    ]);
    // + toda la lógica de guardado
}
```

**✅ Solución:** Crear `App\Http\Requests\StoreVehiculoRequest`, `StoreEquipoRequest`, etc. para encapsular las reglas de validación.

---

### 11. 🟡 Uso de `env()` Directamente en Controladores

**Descripción:** Se usa `env()` directamente en controladores en lugar de `config()`. Cuando se cachea la configuración con `php artisan config:cache`, `env()` retorna `null` ya que el archivo `.env` no se carga en producción.

**Controladores afectados:**
```php
// ❌ MAL — rompe en entornos con configuración cacheada
$apiKey = env('GOOGLE_VISION_API_KEY');      // UserDashboardController, UsuariosController
Stripe::setApiKey(env('STRIPE_SECRET_KEY')); // StripeCheckoutController
$dbName = env('DB_DATABASE', 'forge');       // DynamicTableController
$frontendUrl = env('FRONTEND_URL', 'http://localhost:5173'); // StripeCheckoutController
```

**✅ Solución:** Registrar los valores en `config/services.php` o `config/app.php` y acceder con `config('services.google_vision.key')`.

---

### 12. 🟡 Lógica Duplicada en `asignarUsuarios` y Consultas Manuales a Pivot

**Descripción:** En `FichaController::asignarUsuarios()`, se hace una consulta manual a `DB::table('detalle_ficha_usuarios')` para obtener los roles antes de sincronizar. Esta consulta podría eliminarse si el modelo `Fichas` expusiera el pivot correctamente mediante `withPivot('tipo_participante')` en la relación.

```php
// ❌ MAL — consulta manual a tabla pivot que el ORM ya conoce
$rolesActuales = DB::table('detalle_ficha_usuarios')
    ->where('id_ficha', $id)
    ->pluck('tipo_participante', 'doc')
    ->toArray();
```

**✅ Solución:** Si la relación `Fichas::usuarios()` incluye `withPivot('tipo_participante')`, se puede acceder con `$ficha->usuarios->pluck('pivot.tipo_participante', 'doc')` sin necesidad del `DB::table`.

---

### 13. 🟡 Lógica de Toggle (`if/elseif`) Demasiado Verbosa en Controladores

**Descripción:** Los métodos `toggleEstado` y `setDefaultAsset` en `UserDashboardController` tienen bloques `if/elseif` largos que tratan `vehiculo` y `equipo` por separado con lógica casi idéntica. Esto puede simplificarse con un mapa de configuración.

```php
// ❌ MAL — 40 líneas de if/elseif para dos casos casi idénticos
if ($tipo === 'vehiculo') {
    $item = DB::table('vehiculos')->where('placa', $id)->where('doc', $user->doc)->first();
    // ...
} elseif ($tipo === 'equipo') {
    $item = DB::table('equipos')->join('asignaciones', ...)->where('equipos.serial', $id)->first();
    // ...
}
```

**✅ Solución:** Extraer un método privado `resolveAsset(string $tipo, string $id, string $userDoc)` que retorne el activo o lance una excepción, manteniendo el método principal limpio.

---

## 🛠️ Plan de Acción Prioritario

### Prioridad Alta (hacerlo cuanto antes)

1. **Eliminar todos los `fetch()` directos** de componentes y servicios → usar `apiClient` de `api.ts`.
2. **Crear los servicios faltantes** para `AprobacionesActivos` y `InstitutionsPage`.
3. **Extraer lógica OCR** a `App\Services\GoogleVisionService` en el backend.
4. **Reemplazar `env()` por `config()`** en los 3 controladores afectados.

### Prioridad Media (planificar en el sprint)

5. **Añadir TanStack Query** como capa de caché para todas las peticiones GET de datos.
6. **Definir interfaces TypeScript** para los objetos de dominio y eliminar `any`.
7. **Atomizar** `UserDashboardController` extrayendo lógica de vehículos, equipos y OCR a servicios propios.
8. **Crear Form Requests** para las validaciones más complejas del backend.

### Prioridad Baja (deuda técnica)

9. **Mover estilos inline** a módulos CSS con variables CSS.
10. **Reemplazar `DB::table()`** con Eloquent usando Eager Loading en los controladores más críticos.
11. **Añadir cleanup** a los `useEffect` que hacen fetch (usar `AbortController`).
12. **Dividir páginas grandes** (+500 líneas) en componentes más pequeños con custom hooks.

---

*Análisis generado por revisión estática del código fuente. Todos los fragmentos de código son extractos directos del repositorio.*
