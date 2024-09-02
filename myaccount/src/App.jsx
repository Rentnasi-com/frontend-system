import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthHandler from './AuthHandler';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from './_dashboardLayout';
import { Account, Home, Organization } from './_myaccount';
import { View_Apps } from './apps';

function App() {
  return (
    <Router>
      <main>
        <Toaster />
        <Routes>
          <Route path="/" element={<AuthHandler />} />
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={ <ProtectedRoute> <Home /></ProtectedRoute> } />
            <Route path="/account-setting" element={ <ProtectedRoute> <Account /></ProtectedRoute> } />
            <Route path="/organization-setting" element={ <ProtectedRoute> <Organization /></ProtectedRoute> } />
            <Route path="/view-apps" element={ <ProtectedRoute> <View_Apps /></ProtectedRoute> } />
          </Route>
        </Routes>
      </main>
    </Router>
  );
}

export default App;
