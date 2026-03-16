import { Routes, Route, Navigate } from 'react-router-dom';
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin';
import { PlansPage } from './pages/Plans/PlansPage';
import PublicDashboardPage from './pages/PublicDashboardPage';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import LicensePlansPage from './pages/superadmin/LicensePlansPage';
import InstitutionsPage from './pages/superadmin/InstitutionsPage';
import AdminEntitiesPage from './pages/superadmin/AdminEntitiesPage';
import EntityAdminsPage from './pages/superadmin/EntityAdminsPage';
import ReportsPage from './pages/superadmin/ReportsPage';
import SuperAdmin from './pages/superadmin/SuperAdmin';
import RegisterEntity from './pages/user/RegisterEntity';
import RegisterAdmin from './pages/user/RegisterAdmin';
import NormalAdminLogin from './pages/user/normaladmin/NormalAdminLogin';
import NormalAdminDashboard from './pages/user/normaladmin/Dashboard';
import LicensePayment from './pages/user/normaladmin/LicensePayment';
import ProtectedRoute from './components/common/ProtectedRoute';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyCode from './components/auth/VerifyCode';
import ResetPassword from './components/auth/ResetPassword';
import PaymentSuccess from './pages/user/normaladmin/PaymentSuccess';
import PaymentCancel from './pages/user/normaladmin/PaymentCancel';
import PuertasLayout from './components/layout/PuertasLayout';
import PersonasDashboard from './pages/puertas/PersonasDashboard';
import VehiculosDashboard from './pages/puertas/VehiculosDashboard';
import RegistroPersonasView from './pages/user/normaladmin/RegistroPersonasView';
import RegisterUser from './pages/user/regular/Register';
import NormalAdminLayout from './components/layout/NormalAdminLayout';
import UserLayout from './components/layout/UserLayout';
import UserDashboard from './pages/user/regular/UserDashboard';
import UserHistory from './pages/user/regular/UserHistory';
import UserBarcode from './pages/user/regular/UserBarcode';
import DynamicCrud from './components/dynamic/DynamicCrud';
import ReportePersona from './pages/user/normaladmin/ReportePersona';
import ReporteDiario from './pages/user/normaladmin/ReporteDiario';
import AprobacionesActivos from './pages/user/normaladmin/AprobacionesActivos';

import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <Toaster richColors position="top-right" />
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<PublicDashboardPage />} />
        <Route path="/plans" element={<PlansPage />} />

        {/* Normal Admin Flow */}
        <Route path="/login" element={<NormalAdminLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-code" element={<VerifyCode />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register-entity" element={<RegisterEntity />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/register-user" element={<RegisterUser />} />

        {/* Protected Normal Admin Area */}

        <Route path="/dashboard" element={<NormalAdminDashboard />} />
        <Route path="/user/normaladmin/dashboard" element={<Navigate to="/dashboard" replace />} /> {/* Alias if needed */}

        <Route element={<NormalAdminLayout />}>
          <Route path="/user/normaladmin/registro-personas" element={<RegistroPersonasView />} />
          <Route path="/user/normaladmin/tables/:tableName" element={<DynamicCrud />} />
          <Route path="/user/normaladmin/reportes/persona" element={<ReportePersona />} />
          <Route path="/user/normaladmin/reportes/diario" element={<ReporteDiario />} />
          <Route path="/user/normaladmin/aprobaciones" element={<AprobacionesActivos />} />
        </Route>

        {/* Regular User Flow */}
        <Route element={<UserLayout />}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/historial" element={<UserHistory />} />
          <Route path="/user/codigo" element={<UserBarcode />} />
        </Route>

        <Route path="/license-payment" element={<LicensePayment />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />

        {/* Super Admin Routes */}
        <Route path="/superadmin/login" element={<SuperAdminLogin />} />

        {/* Protected Super Admin Area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/superadmin/admins" element={<SuperAdmin />} />
          <Route path="/superadmin/license-plans" element={<LicensePlansPage />} />
          <Route path="/superadmin/institutions" element={<InstitutionsPage />} />
          <Route path="/superadmin/entities-admins" element={<AdminEntitiesPage />} />
          <Route path="/superadmin/entities-admins/:nit" element={<EntityAdminsPage />} />

          <Route path="/superadmin/reports" element={<ReportsPage />} />
        </Route>


        {/* Legacy/Specific Redirects if needed */}
        <Route path="/normaladmin/login" element={<Navigate to="/login" replace />} />
        <Route path="/normaladmin/dashboard" element={<Navigate to="/dashboard" replace />} />
        {/* Protected Puertas Area */}
        <Route element={<PuertasLayout />}>
          <Route path="/puertas/personas" element={<PersonasDashboard />} />
          <Route path="/puertas/vehiculos" element={<VehiculosDashboard />} />
        </Route>
      </Routes>
    </AuthProvider>


  );
}

export default App;
