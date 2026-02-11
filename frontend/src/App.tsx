import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginSuperAdmin from './pages/superadmin/loginsuperadmin';
import { PlansPage } from './pages/Plans/PlansPage';
import MainPageDashborad from './pages/superadmin/MainPageDashborad';
import LicensePlansPage from './pages/superadmin/LicensePlansPage';
import InstitutionsPage from './pages/superadmin/InstitutionsPage';
import InstitutionDetailsPage from './pages/superadmin/InstitutionDetailsPage';
import ReportsPage from './pages/superadmin/ReportsPage';
import SuperAdmin from './pages/superadmin/SuperAdmin';
import RegisterEntity from './pages/user/RegisterEntity';
import RegisterAdmin from './pages/user/RegisterAdmin';
import NormalAdminLogin from './pages/user/normaladmin/Login';
import NormalAdminDashboard from './pages/user/normaladmin/Dashboard';
import LicensePayment from './pages/user/normaladmin/LicensePayment';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - Starting the Normal Admin Flow */}
        <Route path="/" element={<PlansPage />} />
        <Route path="/plans" element={<PlansPage />} />

        {/* Normal Admin Flow */}
        <Route path="/login" element={<NormalAdminLogin />} />
        <Route path="/register-entity" element={<RegisterEntity />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/dashboard" element={<NormalAdminDashboard />} />
        <Route path="/license-payment" element={<LicensePayment />} />

        {/* Super Admin Routes */}
        <Route path="/superadmin/login" element={<LoginSuperAdmin />} />
        <Route path="/superadmin/dashboard" element={<MainPageDashborad />} />
        <Route path="/superadmin/admins" element={<SuperAdmin />} />
        <Route path="/superadmin/license-plans" element={<LicensePlansPage />} />
        <Route path="/superadmin/institutions" element={<InstitutionsPage />} />
        <Route path="/superadmin/institutions/:id" element={<InstitutionDetailsPage />} />
        <Route path="/superadmin/reports" element={<ReportsPage />} />

        {/* Legacy/Specific Redirects if needed */}
        <Route path="/normaladmin/login" element={<Navigate to="/login" replace />} />
        <Route path="/normaladmin/dashboard" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

