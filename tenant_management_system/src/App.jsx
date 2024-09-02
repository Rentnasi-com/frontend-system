import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './_dashboardLayout';
import ProtectedRoute from './ProtectedRoute'
import AuthHandler from './AuthHandler';
import { AddTenantProperty, Add_Personal_Info } from './_tenants_management/_add_tenant/pages';
import TenantDashboard from './_tenants_management/_dashboard/home';
import { Toaster } from 'react-hot-toast';
import { ViewAllTenants, ViewTenant } from './_tenants_management/listing';

const App = () => {
  return (
    <Router>
      <main>
        <Toaster />
        <Routes>
          <Route path="/" element={<AuthHandler />} />
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<TenantDashboard />} />}
            />
            {/* Tenant Management */}
            <Route
              path="/tenants"
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
              path="/tenants/view-all-tenants"
              element={<ProtectedRoute element={<ViewAllTenants />} />}
            />
            <Route
              path="/tenants/view-all-tenants"
              element={<ProtectedRoute element={<ViewAllTenants />} />}
            />
            <Route
              path="/tenants/view-tenants"
              element={<ProtectedRoute element={<ViewTenant />} />}
            />
          </Route>
        </Routes>
      </main>
    </Router>
  );
};

export default App;
