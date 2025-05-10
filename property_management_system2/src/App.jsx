import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AddMultiSingleUnit, Amenities, General_information, ManageImages, Property_floors, Property_summary, Property_types, Single_Unit, } from './_property_management/_add_property/pages';
import { Account, HelpCenter, Home2, Inquiries, Maintenance, PropertyDashboard, Recycle, Reports, Settings } from './_property_management/_dashboard';
import ChatRoom from './_property_management/_dashboard/pages/chat_room';
import { MaintenanceChatRoom, MarketUnit, PaymentHistory, PaymentsDetails, Property, PropertyListing, ReceivePayment, RevenueBreakdown, TenantHistory, Unit, UnitListing } from './_property_management/_dashboard/pages';
import DashboardLayout from './_dashboardLayout';
import AuthHandler from './AuthHandler';
import ProtectedRoute from './ProtectedRoute';
import { MonthlyRevenueBreakdown } from './_property_management/_dashboard/reportsPages';
import Chat from './chat';
import { EditAmenities, EditGeneralInformation, EditManageImages, EditMultiUnit, EditMultiUnitSingleUnit, EditPropertyTypes, EditSingleUnit } from './_property_management/_edit_property';
import { AddLandlordPaymentsDetails, AddLandlordPersonalInfo } from './_property_management/landlords/add_landlord';
import { LandlordSingleView, ViewLandlord } from './_property_management/landlords/dashboard';
import { EditLandlordPaymentsDetails, EditLandlordPersonalInfo } from './_property_management/landlords/edit_landlord';
import {Add_Personal_Info, AddTenantProperty } from './_property_management/tenants/add_tenant';
import {EditPersonalInfo, EditTenantProperty } from './_property_management/tenants/edit_tenant';
import { Tenants } from './_property_management/tenants/dashboard';

const App = () => {
  return (
    <Router>
      <main className="font-sans">
        <Toaster />
        <Routes>
          <Route path="/" element={<AuthHandler />} />
          <Route element={<DashboardLayout />}>

            {/* Property management */}
            <Route
              path="/dashboard"
              element={<ProtectedRoute element={<Home2 />} />}
            />
            <Route
              path="/properties"
              element={<ProtectedRoute element={<PropertyDashboard />} />}
            />
            
            <Route
              path="/add-property/general-information"
              element={<ProtectedRoute element={<General_information />} />}
            />
            <Route
              path="/edit-property/general-information"
              element={<ProtectedRoute element={<EditGeneralInformation />} />}
            />
            <Route
              path="/add-property/amenities"
              element={<ProtectedRoute element={<Amenities />} />}
            />
            <Route
              path="/edit-property/amenities"
              element={<ProtectedRoute element={<EditAmenities />} />}
            />
            <Route
              path="/add-property/property-type"
              element={<ProtectedRoute element={<Property_types />} />}
            />
            <Route
              path="/edit-property/property-type"
              element={<ProtectedRoute element={<EditPropertyTypes />} />}
            />
            <Route
              path="/add-property/multi-unit"
              element={<ProtectedRoute element={<Property_floors />} />}
            />
            <Route
              path="/add-property/multi-single-unit"
              element={<ProtectedRoute element={<AddMultiSingleUnit />} />}
            />
            <Route
              path="/edit-property/multi-unit"
              element={<ProtectedRoute element={<EditMultiUnit />} />}
            />
            <Route
              path="/add-property/single-unit"
              element={<ProtectedRoute element={<Single_Unit />} />}
            />
            <Route
              path="/edit-property/single-unit"
              element={<ProtectedRoute element={<EditSingleUnit />} />}
            />
            <Route
              path="/add-property/manage-images"
              element={<ProtectedRoute element={<ManageImages />} />}
            />
            <Route
              path="/edit-property/manage-images"
              element={<ProtectedRoute element={<EditManageImages />} />}
            />
            <Route
              path="/edit-property/single-unit/:property_id/:unit_id"
              element={<ProtectedRoute element={<EditMultiUnitSingleUnit />} />}
            />
            
            <Route
              path="/add-property/property-summary"
              element={<ProtectedRoute element={<Property_summary />} />}
            />
            <Route
              path="/property/property-listing"
              element={<ProtectedRoute element={<PropertyListing />} />}
            />
            <Route
              path="/property/all-property-units"
              element={<ProtectedRoute element={<UnitListing />} />}
            />
            <Route
              path="/dashboard/inquiries"
              element={<ProtectedRoute element={<Inquiries />} />}
            />
            <Route
              path="/dashboard/inquiries/chatroom"
              element={<ProtectedRoute element={<ChatRoom />} />}
            />
            <Route
              path="/property/revenue-breakdown"
              element={<ProtectedRoute element={<RevenueBreakdown />} />}
            />
            <Route
              path="/property/view-property/:property_id"
              element={<ProtectedRoute element={<Property />} />}
            />
            <Route
              path="/property/single-unit/:unit_id"
              element={<ProtectedRoute element={<Unit />} />}
            />
            <Route
              path="/property/payment-history"
              element={<ProtectedRoute element={<PaymentHistory />} />}
            />
            <Route
              path="/property/unit/tenant-history/:unit_id"
              element={<ProtectedRoute element={<TenantHistory />} />}
            />
            <Route
              path="/account"
              element={<ProtectedRoute element={<Account />} />}
            />
            <Route
              path="/help-center"
              element={<ProtectedRoute element={<HelpCenter />} />}
            />
            <Route
              path="/maintenance"
              element={<ProtectedRoute element={<Maintenance />} />}
            />
            <Route
              path="/dashboard/maintenance/chatroom"
              element={<ProtectedRoute element={<MaintenanceChatRoom />} />}
            />
            <Route
              path="/dashboard/reports"
              element={<ProtectedRoute element={<Reports />} />}
            />
            <Route
              path="/dashboard/reports/revenue-breakdown"
              element={<ProtectedRoute element={<MonthlyRevenueBreakdown />} />}
            />
            <Route
              path="/settings"
              element={<ProtectedRoute element={<Settings />} />}
            />
            <Route
              path="/chat"
              element={<ProtectedRoute element={<Chat />} />}
            />
            <Route
              path="/recycle"
              element={<ProtectedRoute element={<Recycle />} />}
            />
            <Route
              path="/landlords"
              element={<ProtectedRoute element={<ViewLandlord />} />}
            />
            <Route
              path="/landlords/view-landlord/:landlord_id"
              element={<ProtectedRoute element={<LandlordSingleView />} />}
            />
            <Route
              path="/add-landlord/personal-information"
              element={<ProtectedRoute element={<AddLandlordPersonalInfo />} />}
            />
            <Route
              path="/add-landlord/payment-details"
              element={<ProtectedRoute element={<AddLandlordPaymentsDetails />} />}
            />
            <Route
              path="/edit-landlord/personal-information/"
              element={<ProtectedRoute element={<EditLandlordPersonalInfo />} />}
            />
            <Route
              path="/edit-landlord/payment-details/"
              element={<ProtectedRoute element={<EditLandlordPaymentsDetails />} />}
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
              path="/property/receive-payment"
              element={<ProtectedRoute element={<ReceivePayment />} />}
            />
            <Route
              path="/property/market-unit"
              element={<ProtectedRoute element={<MarketUnit />} />}
            />
            <Route
              path="/settings/payment_details"
              element={<ProtectedRoute element={<PaymentsDetails />} />}
            />
          </Route>
        </Routes>
      </main>
    </Router>
  );
};

export default App;
