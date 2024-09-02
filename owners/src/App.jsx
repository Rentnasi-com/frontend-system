import './App.css'
import AuthHandler from './AuthHandler'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import {
  Amenities,
  General_information,
  Manage_images,
  Property_floors,
  Property_summary,
  Property_types,
  Single_Unit,
} from './_property_management/_add_property/pages';
import { Toaster } from 'react-hot-toast'
import PropertyDashboard from './_property_management/_dashboard/home';
import DashboardLayout from './_dashboardLayout';
import {
  Property_listing,
  UnitListing,
  View_Property,
} from './_property_management/_property';
import TenantDashboard from './_tenants_management/_dashboard/home';


const App = () => {
  return (
    <Router>
      <main>
        <Toaster />
        <Routes>
          <Route path="/" element={<AuthHandler />} />
          <Route element={<DashboardLayout />}>

            {/* Property management */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute><PropertyDashboard /></ProtectedRoute>}
            />
            <Route
              path="/add-property/general-information"
              element={<ProtectedRoute element={<General_information />} />}
            />
            <Route
              path="/add-property/amenities"
              element={<ProtectedRoute element={<Amenities />} />}
            />
            <Route
              path="/add-property/property-type"
              element={<ProtectedRoute><Property_types /></ProtectedRoute>}
            />
            <Route
              path="/add-property/multi-unit"
              element={<ProtectedRoute element={<Property_floors />} />}
            />
            <Route
              path="/add-property/single-unit"
              element={<ProtectedRoute element={<Single_Unit />} />}
            />
            <Route
              path="/add-property/manage-images"
              element={<ProtectedRoute element={<Manage_images />} />}
            />
            <Route
              path="/add-property/property-summary"
              element={<ProtectedRoute element={<Property_summary />} />}
            />
            <Route
              path="/property/property-listing"
              element={<ProtectedRoute> <Property_listing /> </ProtectedRoute>}
            />
            <Route
              path="/property/view-property"
              element={<ProtectedRoute element={<View_Property />} />}
            />
            <Route
              path="property/unit-listing"
              element={<ProtectedRoute element={<UnitListing />} />}
            />

            {/* Tenant Management */}
            <Route
              path="/tenants"
              element={<ProtectedRoute><TenantDashboard /></ProtectedRoute>}
            />
          </Route>
        </Routes>
      </main>
    </Router>
  )
}

export default App
