import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginSuperAdmin from './pages/superadmin/loginsuperadmin';
import { PlansPage } from './pages/Plans/PlansPage';
import PublicDashboardPage from './pages/PublicDashboardPage';
import MainPageDashborad from './pages/superadmin/MainPageDashborad';
import LicensePlansPage from './pages/superadmin/LicensePlansPage';
import InstitutionsPage from './pages/superadmin/InstitutionsPage';

import ReportsPage from './pages/superadmin/ReportsPage';
import SuperAdmin from './pages/superadmin/SuperAdmin';
import RegisterEntity from './pages/user/RegisterEntity';
import RegisterAdmin from './pages/user/RegisterAdmin';
import NormalAdminLogin from './pages/user/normaladmin/Login';
import NormalAdminDashboard from './pages/user/normaladmin/Dashboard';
import LicensePayment from './pages/user/normaladmin/LicensePayment';
import ProtectedRoute from './components/common/ProtectedRoute';
import ForgotPassword from './components/auth/ForgotPassword';
import VerifyCode from './components/auth/VerifyCode';
import ResetPassword from './components/auth/ResetPassword';
import PaymentSuccess from './pages/user/normaladmin/PaymentSuccess';
import PaymentCancel from './pages/user/normaladmin/PaymentCancel';
import NormalAdminLayout from './components/layout/NormalAdminLayout';
import DynamicCrud from './components/dynamic/DynamicCrud';

function App() {
  return (
    <BrowserRouter>
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

        {/* Protected Normal Admin Area */}
        <Route element={<NormalAdminLayout />}>
          <Route path="/dashboard" element={<NormalAdminDashboard />} />
          <Route path="/user/normaladmin/dashboard" element={<Navigate to="/dashboard" replace />} /> {/* Alias if needed */}
          <Route path="/user/normaladmin/tables/:tableName" element={<DynamicCrud />} />
          <Route path="/license-payment" element={<LicensePayment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-cancel" element={<PaymentCancel />} />
        </Route>

        {/* Super Admin Routes */}
        <Route path="/superadmin/login" element={<LoginSuperAdmin />} />

        {/* Protected Super Admin Area */}
        <Route element={<ProtectedRoute />}>
          <Route path="/superadmin/dashboard" element={<MainPageDashborad />} />
          <Route path="/superadmin/admins" element={<SuperAdmin />} />
          <Route path="/superadmin/license-plans" element={<LicensePlansPage />} />
          <Route path="/superadmin/institutions" element={<InstitutionsPage />} />

          <Route path="/superadmin/reports" element={<ReportsPage />} />
        </Route>

        {/* Legacy/Specific Redirects if needed */}
        <Route path="/normaladmin/login" element={<Navigate to="/login" replace />} />
        <Route path="/normaladmin/dashboard" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
