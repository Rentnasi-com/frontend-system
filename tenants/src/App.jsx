import { Toaster } from 'react-hot-toast'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import DashboardLayout from './tenants/_tenant_dashboard'
import Home from './tenants/home'
import { EditProfile } from './tenants/edit-profile'


function App() {
  return (
    <main>
      <Toaster />
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard/edit-profile" element={<EditProfile />} />
        </Route>
      </Routes>
    </main>
  )
}

export default App
