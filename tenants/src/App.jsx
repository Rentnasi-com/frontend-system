import { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import DashboardLayout from './tenants/_tenant_dashboard'
import { Maintenance, PaymentsTab, TenantDashboard } from './tenants/pages'


function App() {
  return (
    <main>
      <Toaster />
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<TenantDashboard />} />
          <Route path="/dashboard/payments" element={<PaymentsTab />} />
          <Route path="/dashboard/maintenance" element={<Maintenance />} />
        </Route>
      </Routes>
    </main>
  )
}

export default App
