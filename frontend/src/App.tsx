import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginSuperAdmin from './pages/superadmin/loginsuperadmin';
import { PlansPage } from './pages/Plans/PlansPage';
import MainPageDashborad from './pages/superadmin/MainPageDashborad';
import LicensePlansPage from './pages/superadmin/LicensePlansPage';
import InstitutionsPage from './pages/superadmin/InstitutionsPage';
import InstitutionDetailsPage from './pages/superadmin/InstitutionDetailsPage';
import ReportsPage from './pages/superadmin/ReportsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/superadmin/dashboard" replace />} />
        <Route path="/superadmin/dashboard" element={<MainPageDashborad />} />
        <Route path="/superadmin/license-plans" element={<LicensePlansPage />} />
        <Route path="/superadmin/institutions" element={<InstitutionsPage />} />
        <Route path="/superadmin/institutions/:id" element={<InstitutionDetailsPage />} />
        <Route path="/superadmin/reports" element={<ReportsPage />} />
        <Route path="/login" element={<LoginSuperAdmin />} />
        <Route path="/plans" element={<PlansPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

