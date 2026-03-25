import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeNames: Record<string, string> = {
  '/': 'Inicio | SENA',
  '/plans': 'Planes de Licencia | SENA',
  '/login': 'Iniciar Sesión | SENA',
  '/forgot-password': 'Recuperar Contraseña | SENA',
  '/verify-code': 'Verificar Código | SENA',
  '/reset-password': 'Restablecer Contraseña | SENA',
  '/register-entity': 'Registrar Entidad | SENA',
  '/register-admin': 'Registrar Administrador | SENA',
  '/register-user': 'Registrar Usuario | SENA',
  '/dashboard': 'Panel Principal | SENA',
  '/superadmin/login': 'Login Super Admin | SENA',
  '/superadmin/dashboard': 'Panel Super Admin | SENA',
  '/superadmin/admins': 'Administradores | SENA',
  '/superadmin/license-plans': 'Planes de Licencia | SENA',
  '/superadmin/institutions': 'Instituciones | SENA',
  '/superadmin/entities-admins': 'Entidades Admin | SENA',
  '/superadmin/reports': 'Reportes | SENA',
  '/puertas/personas': 'Control Personas | SENA',
  '/puertas/vehiculos': 'Control Vehículos | SENA',
  '/user/dashboard': 'Panel de Usuario | SENA',
  '/user/historial': 'Historial | SENA',
  '/user/codigo': 'Mi Código | SENA',
  '/user/instructor/asistencia': 'Asistencia | SENA',
  '/user/instructor/equipos': 'Equipos Asignados | SENA',
  '/user/normaladmin/registro-personas': 'Registro Personas | SENA',
  '/user/normaladmin/reportes/persona': 'Reportes Persona | SENA',
  '/user/normaladmin/reportes/diario': 'Reporte Diario | SENA',
  '/user/normaladmin/aprobaciones': 'Aprobaciones | SENA',
  '/user/normaladmin/fichas/crear': 'Crear Ficha | SENA',
  '/user/normaladmin/fichas/asignar': 'Asignar Ficha | SENA',
  '/user/normaladmin/fichas/lista': 'Lista Fichas | SENA',
  '/user/normaladmin/equipos/registrar': 'Registrar Equipos | SENA',
  '/user/normaladmin/equipos/asignar': 'Asignar Equipos | SENA',
  '/user/normaladmin/equipos/gestion-lotes': 'Gestión Lotes | SENA',
  '/user/normaladmin/equipos/historial': 'Historial Equipos | SENA',
  '/license-payment': 'Pago de Licencia | SENA',
  '/payment-success': 'Pago Exitoso | SENA',
  '/payment-cancel': 'Pago Cancelado | SENA',
};

const DocumentTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Exact match
    if (routeNames[currentPath]) {
      document.title = routeNames[currentPath];
      return;
    }

    // Dynamic matches
    if (currentPath.startsWith('/user/normaladmin/tables/')) {
      document.title = 'Gestión de Tabla | SENA';
      return;
    }

    if (currentPath.startsWith('/superadmin/entities-admins/')) {
      document.title = 'Admins de Entidad | SENA';
      return;
    }

    // Default title
    document.title = 'SENA';
  }, [location]);

  return null;
};

export default DocumentTitleUpdater;
