# Manual de Despliegue Local (Entorno de Desarrollo)

Proyecto: Entrada y Salida (Control de Accesos y Activos)
Stack Tecnológico: Backend en Laravel 12 (PHP) y Frontend en React 19 (Vite)

## Requisitos previos

**Software requerido**
- Git
- PHP >= 8.x
- Composer
- Node.js >= 18
- XAMPP (Apache + MySQL)

**Verificación de Git**
Antes de clonar el repositorio, asegúrate de tener instalado Git. Para verificar si está instalado, ejecuta en la terminal:
```bash
git --version
```
Si no está instalado, descárgalo desde: https://git-scm.com/

---

## 1. Instalación del entorno (XAMPP + BD)

*Nota: Es fundamental instalar XAMPP primero para tener disponible la ruta `C:\xampp\htdocs` donde clonaremos el proyecto, y tener la base de datos lista antes de configurar el backend.*

**Descarga e Instalación de XAMPP**
1. Dirígete al sitio oficial de XAMPP: https://www.apachefriends.org/es/index.html
2. Descarga la versión compatible con tu sistema operativo.
3. Ejecuta el instalador y selecciona los componentes (Apache, MySQL, phpMyAdmin).
4. Ruta de instalación recomendada: `C:\xampp`. Finaliza la instalación.

**1.1 Iniciar los Servicios**
- Abre el panel de control de XAMPP (`xampp-control.exe`).
- Inicia los servicios **Apache** y **MySQL**. Verifica que ambos estén en color verde.

**1.2 Acceso a phpMyAdmin**
- Abre tu navegador web y accede a: `http://localhost/phpmyadmin/`
- Esto abrirá la interfaz para gestionar tus bases de datos.

**1.3 Creación de la Base de Datos**
- Haz clic en "Nueva" (lado izquierdo).
- Ingresa el nombre de la base de datos (ej. `control-ingreso-salida`).
- Haz clic en Crear.

**1.4 Configuración de Usuario y Contraseña (Opcional)**
Por defecto, MySQL en XAMPP usa:
- Usuario: `root`
- Contraseña: *(vacía)*

Si configuras una contraseña segura editando el usuario `root` en "Cuentas de usuario", deberás recordarla para el archivo `.env` del backend más adelante.

---

## 2. Clonación del proyecto

Esta sección describe el proceso para descargar el proyecto desde GitHub en la carpeta de tu servidor local.

**2.1 Obtener la URL del Repositorio**
- Dirígete al repositorio del proyecto en GitHub, haz clic en el botón verde "Code" y copia la URL: `https://github.com/Newtbot23/Proyecto-entrada-y-salida.git`

**2.2 Clonar el Repositorio**
Abre una terminal (CMD, PowerShell o Git Bash) y ejecuta los siguientes comandos para situarte en XAMPP y descargar el código:
```bash
cd C:\xampp\htdocs
git clone https://github.com/Newtbot23/Proyecto-entrada-y-salida.git
```

**2.3 Acceder al Proyecto**
Una vez finalizada la clonación, ingresa a la carpeta raíz del proyecto:
```bash
cd Proyecto-entrada-y-salida
```

**2.4 Verificación**
Ejecuta `git status`. Si todo está correcto, deberías ver:
```
On branch main
nothing to commit, working tree clean
```

---

## 3. Obtención de Credenciales y APIs (Stripe y Google Cloud)

*Antes de configurar las variables de entorno del proyecto, debes tener listas las claves de los servicios de terceros utilizados.*

**3.1 Cómo obtener las credenciales de Stripe (Pagos)**
1. Inicia sesión en tu panel de control de Stripe (https://dashboard.stripe.com/).
2. Activa el interruptor "Modo de prueba" (Test mode) en la esquina superior derecha.
3. Ve a **Desarrolladores > Claves de API** (API keys).
4. Guarda tu **Clave publicable** (`pk_test_...`) temporalmente (se usará en Backend y Frontend).
5. Guarda tu **Clave secreta** (`sk_test_...`) temporalmente (se usará **solo** en el Backend).

**3.2 Cómo obtener la API Key de Google Cloud Vision (OCR para documentos/placas)**
1. Ingresa a la Consola de Google Cloud e inicia sesión.
2. Crea un "Proyecto Nuevo", asígnale nombre y haz clic en Crear.
3. Ve a "API y servicios" > "Biblioteca". Busca "Cloud Vision API" y haz clic en "Habilitar".
4. Ve a "API y servicios" > "Credenciales".
5. Haz clic en "+ CREAR CREDENCIALES" y elige "Clave de API" (API Key). Guarda esta clave temporalmente.

---

## 4. Configuración del Backend (Laravel)

**4.1 Ubicación del Proyecto**
Navega a la carpeta del backend en tu terminal:
```bash
cd C:\xampp\htdocs\Proyecto-entrada-y-salida\backend
```

**4.2 Instalación de Dependencias**
El siguiente comando descargará las librerías necesarias de Laravel, Sanctum, Stripe PHP, DomPDF, etc.:
```bash
composer install
```

**4.3 Variables de entorno (.env)**
El archivo `.env.example` actúa como plantilla. Duplícalo para crear tu archivo `.env` local:
```bash
cp .env.example .env
```
Abre el archivo `.env` en tu editor de código y completa usando la información de los **Pasos 1 y 3**:
- **DB_DATABASE, DB_USERNAME, DB_PASSWORD**: Usa el nombre de la DB (ej. `control-ingreso-salida`), `root`, y tu contraseña de MySQL respectivamente.
- **SANCTUM_STATEFUL_DOMAINS**: `localhost:5173`
- **STRIPE_KEY** y **STRIPE_SECRET**: Pega aquí las claves obtenidas en el **Paso 3.1**.

**4.4 Generación de la Application Key**
```bash
php artisan key:generate
```

**4.5 Ejecución de Migraciones y Seeders (Verificación de Conexión)**
Este comando creará las tablas en tu base de datos y correrá los "seeders" para poblarla, comprobando al mismo tiempo que la conexión de Laravel a MySQL (Paso 1) sea correcta:
```bash
php artisan migrate --seed
```

**4.6 Enlace del Almacenamiento (Storage Link)**
Para que las imágenes subidas o PDFs generados sean visibles públicamente en el frontend:
```bash
php artisan storage:link
```

**4.7 Levantar el Servidor Backend**
Deja esta terminal corriendo:
```bash
php artisan serve
```
El backend estará alojado en `http://127.0.0.1:8000`.

---

## 5. Configuración del Frontend (React + Vite)

**5.1 Ubicación del Proyecto**
Abre una **nueva pestaña** en tu terminal y dirígete a:
```bash
cd C:\xampp\htdocs\Proyecto-entrada-y-salida\frontend
```

**5.2 Instalación de Dependencias**
Descarga e instala los paquetes de React (como React Query, Stripe JS, Tesseract):
```bash
npm install
```

**5.3 Variables de entorno (.env)**
Duplica la configuración base:
```bash
cp .env.example .env
```
Abre el archivo `.env` del frontend en tu editor y rellena lo siguiente:
- **VITE_API_URL**: `http://127.0.0.1:8000/api` (comprueba que coincida con la URL de tu backend en el Paso 4.7).
- **VITE_BACKEND_URL**: `http://127.0.0.1:8000`
- **VITE_STRIPE_PUBLIC_KEY**: Pega aquí estrictamente la **Clave Publicable** (`pk_test_...`) de Stripe del **Paso 3.1**. ¡Nunca la secreta!

**5.4 Levantar el Servidor Frontend**
```bash
npm run dev
```
La aplicación frontend se iniciará en `http://localhost:5173`.

**5.5 Conexión Frontend ↔ Backend (Verificación CORS)**
- Abre `http://localhost:5173` en tu navegador web.
- Abre la pestaña de Red de las Herramientas del Desarrollador (F12). Al iniciar sesión, la llamada a la ruta del backend debe responder con estatus verde (Ej. `200 OK`).

---

## 6. Verificación del sistema

Con ambos servidores (frontend y backend) corriendo simultáneamente, verifica los flujos críticos del proyecto:
1. **Autenticación (Login Roles):** Inicia sesión comprobando los roles de usuario (Super Admin, Guarda) generados.
2. **Generación y Lectura QR / OCR:** Crea un registro formal de un vehículo y valida la visibilidad de códigos QR o la lectura de placas mediante la cámara.
3. **Reportes PDF:** Navega a los listados de auditoría y verifica que puedan generarse e imprimirse.
4. **Pasarela Stripe:** Accede a la funcionalidad de pagos y corrobora que la interfaz de la tarjeta de crédito renderice correctamente.

---

## 7. Problemas comunes (Troubleshooting)

**Problemas con XAMPP**
- **Error: MySQL no inicia:** El puerto 3306 está ocupado. Cierra otros servicios que puedan usarlo (como versiones instaladas de MySQL Server) o cámbialo en la configuración de XAMPP.
- **Acceso denegado en phpMyAdmin:** Configura las credenciales correctas en el archivo `config.inc.php` de phpMyAdmin dentro de XAMPP.

**Errores en Backend (Laravel)**
- **SQLSTATE[HY000] [1049] Unknown database:** El nombre definido en `DB_DATABASE` en tu `.env` no coincide exactamente con tu nombre de la base de datos local pre-creada.
- **Target class [...] does not exist:** Esto suele deberse la caché de PHP corrupta. Ejecuta en el backend:
  ```bash
  composer dump-autoload
  php artisan optimize:clear
  ```

**Errores en Frontend (React)**
- **Error EADDRINUSE (Puerto Ocupado npm):** Significa que el puerto 5173 ya está en uso. React/Vite probará automáticamente con el 5174, lo cual puede desajustar tus configuraciones de CORS del backend. Cierra otras terminales de Node bloqueadas.
- **Error "Blocked by CORS policy":** Laravel está bloqueando el origen de React. Revisa que en `config/cors.php` del backend y las variables `.env`, tanto el frontend (localhost/127.0.0.1) como los puertos, correspondan unos a otros de forma consistente.