import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute'
import AuthHandler from './AuthHandler';
import Layout from './_layout';
import { Toaster } from 'react-hot-toast';
import { Add_Personal_Info, AddTenantProperty } from './pages/add_tenant/pages';
import TenantDashboard from './pages/dashboard/tenantDashboard';
import { MonthlyPaymentHistory, SingleTenants, TenancyHistory, Tenants } from './pages/tenants';
import { TenantRevenueBreakdown } from './pages/reports/pages';
import Maintenance from './pages/maintenance/maintenance';
import ChatRoom from './pages/chat_room/chat_room';
import Inquiries from './pages/inquiries/inquiries';
import Reports from './pages/reports/reports';
import EditPersonalInfo from './pages/edit_tenant/edit_personal_info';
import { EditTenantProperty } from './pages/edit_tenant';


const App = () => {
  return (
    <Router>
      <main className="font-sans">
        <Toaster />
        <Routes>
          <Route path="/" element={<AuthHandler />} />
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<TenantDashboard />} />}
            />
            
            <Route
              path="/tenants/add-personal-details"
              element={<ProtectedRoute element={<Add_Personal_Info />} />}
            />
            <Route
              path="/tenants/add-tenant-unit"
              element={<ProtectedRoute element={<AddTenantProperty />} />}
            />
            <Route
              path="/tenants/edit-personal-details"
              element={<ProtectedRoute element={<EditPersonalInfo />} />}
            />
            <Route
              path="/tenants/edit-tenant-unit"
              element={<ProtectedRoute element={<EditTenantProperty />} />}
            />
            <Route
              path="/tenants"
              element={<ProtectedRoute element={<Tenants />} />}
            />
            <Route
              path="/tenants/single-tenants"
              element={<ProtectedRoute element={<SingleTenants />} />}
            />
            <Route
              path="/tenants/unit/tenant-history"
              element={<ProtectedRoute element={<SingleTenants />} />}
            />
            <Route
              path="/tenants/monthly-payment-history"
              element={<ProtectedRoute element={<MonthlyPaymentHistory />} />}
            />
            <Route
              path="/tenants/revenue-breakdown"
              element={<ProtectedRoute element={<TenantRevenueBreakdown />} />}
            />
            <Route
              path="/tenants/payment-history"
              element={<ProtectedRoute element={<TenancyHistory />} />}
            />
            <Route
              path="/maintenance"
              element={<ProtectedRoute element={<Maintenance />} />}
            />
            <Route
              path="/chatroom"
              element={<ProtectedRoute element={<ChatRoom />} />}
            />
            <Route
              path="/inquiries"
              element={<ProtectedRoute element={<Inquiries />} />}
            />
            <Route
              path="/reports"
              element={<ProtectedRoute element={<Reports />} />}
            />
            <Route
              path="/reports/revenue-breakdown"
              element={<ProtectedRoute element={<Reports />} />}
            />
          </Route>
        </Routes>
      </main>
    </Router>
  );
};

export default App;
