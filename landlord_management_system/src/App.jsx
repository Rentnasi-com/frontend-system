import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './_dashboardLayout';
import ProtectedRoute from './ProtectedRoute'
import AuthHandler from './AuthHandler';
import { Toaster } from 'react-hot-toast';
import { AddLandlord, LandlordDashboard, LandlordPayments } from './_landlord';
import ViewLandlord from './_landlord/dashboard/view_landlord/view_landlord';

const App = () => {
  return (
    <Router>
      <main>
        <Toaster />
        <Routes>
          <Route path="/" element={<AuthHandler />} />
          <Route element={<DashboardLayout />}>
            {/* Landlord Management */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<LandlordDashboard />} />}
            />
            <Route
              path="/landlord/add-landlord"
              element={<ProtectedRoute element={<AddLandlord />} />}
            />
            <Route
              path="/landlord/add-payment-details"
              element={<ProtectedRoute element={<LandlordPayments />} />}
            />
            <Route
              path="/landlord/view-landlords"
              element={<ProtectedRoute element={<ViewLandlord />} />}
            />
          </Route>
        </Routes>
      </main>
    </Router>
  );
};

export default App;
