import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './_dashboardLayout';
import ProtectedRoute from './ProtectedRoute'
import AuthHandler from './AuthHandler';
import {
  Amenities,
  General_information,
  Manage_images,
  Property_floors,
  Property_summary,
  Property_types,
  Single_Unit,
} from './_property_management/_add_property/pages';
import {
  Property_listing,
  UnitListing,
  View_Property,
} from './_property_management/_property';
import {
  AddTenantProperty,
  Add_Personal_Info,
} from './_tenants_management/_add_tenant/pages';
import PropertyDashboard from './_property_management/_dashboard/home';
import TenantDashboard from './_tenants_management/_dashboard/home';
import EditAccount from './_account/_edit_account/edit_account';
import AccountDashboard from './_account/home';
import { Toaster } from 'react-hot-toast';
import { AddLandlord, LandlordDashboard, LandlordPayments } from './_landlord';
import UploadImage from './_account/uploadImage';

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
              element={<ProtectedRoute element={<PropertyDashboard />} />}
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
              element={<ProtectedRoute element={<Property_types />} />}
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
              element={<ProtectedRoute element={<Property_listing />} />}
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

            {/* Landlord Management */}
            <Route
              path="/landlord"
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

            {/* Account Management */}
            <Route
              path="/account"
              element={<ProtectedRoute element={<AccountDashboard />} />}
            />
            <Route
              path="/account/edit-account"
              element={<ProtectedRoute element={<EditAccount />} />}
            />
            <Route
              path="/image-upload"
              element={<ProtectedRoute element={<UploadImage />} />}
            />
          </Route>
        </Routes>
      </main>
    </Router>
  );
};

export default App;
