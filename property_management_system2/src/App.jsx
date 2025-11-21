import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthContext';
import DashboardLayout from './_dashboardLayout';
import ProtectedRoute from './ProtectedRoute';

import { BulkWaterBill, ReceiveElectricityBilling, ReceivePayment } from './_property_management/billings'
import { MakePaybillPdf, PaymentsDetails, Settings } from './_property_management/settings'
import { AddLandlordPaymentsDetails, AddLandlordPersonalInfo, EditLandlordPaymentsDetails, EditLandlordPersonalInfo, LandlordSingleView, ViewLandlord } from './_property_management/landlords'
import { AddFloors, AddMultiSingleUnit, Amenities, EditAmenities, EditGeneralInformation, EditManageImages, EditMultiUnit, EditMultiUnitSingleUnit, EditPropertyTypes, EditSingleUnit, General_information, Home2, ManageImages, MarketUnit, PaymentHistory, Property, Property_floors, Property_summary, Property_types, PropertyListing, Single_Unit, Unit, UnitListing } from './_property_management/properties'
import { Add_Personal_Info, AddTenantProperty, EditPersonalInfo, EditTenantProperty, TenantHistory, Tenants, TenantUnits } from './_property_management/tenants'
import { ChatRoom, Inquiries } from './_property_management/inquiries'
import { Recycle } from './_property_management/recycleBin'
import { HelpCenter } from './_property_management/helpCenter'
import { MonthlyRevenueBreakdown, Reports, RevenueBreakdown } from './_property_management/reports'
import { SingleStaffPage, Users } from './_property_management/users';
import { AddPersonalInfo, AddPropertiesAssignPermissions } from './_property_management/users/add_staff';
import { EditStaffPermissions, EditStaffProperties, EditStaffInfo } from './_property_management/users/edit_staff';
import { ArrearsDashboard, DueRent, PaymentsReceived, TransferPayment } from './_property_management/analytics';
import { AddEvent, EventsListing } from './_property_management/deductions';
import { LoanDetails, LoanPayment, LoansDashboard, NewLoanApplication } from './_property_management/loans';


const App = () => {
    return (
        <AuthProvider>
            <Router>
                <main className="font-sans">
                    <Toaster position="top-right" />
                    <Routes>

                        <Route element={<DashboardLayout />}>
                            {/* Update all ProtectedRoute usage */}
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Home2 />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Home2 />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Property routes with specific permissions */}
                            <Route
                                path="/add-property/general-information"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="add">
                                        <General_information />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-property/general-information"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="edit">
                                        <EditGeneralInformation />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-property/amenities"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="add">
                                        <Amenities />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-property/amenities"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="edit">
                                        <EditAmenities />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-property/property-type"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="add">
                                        <Property_types />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-property/property-type"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="edit">
                                        <EditPropertyTypes />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-property/multi-unit"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="add">
                                        <Property_floors />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-property/multi-single-unit"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="add">
                                        <AddMultiSingleUnit />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-property/add-floors"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="add">
                                        <AddFloors />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-property/multi-unit"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="edit">
                                        <EditMultiUnit />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-property/single-unit"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="add">
                                        <Single_Unit />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-property/single-unit"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="edit">
                                        <EditSingleUnit />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-property/manage-images"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="add">
                                        <ManageImages />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-property/manage-images"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="edit">
                                        <EditManageImages />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-property/single-unit/:property_id/:unit_id"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="edit">
                                        <EditMultiUnitSingleUnit />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-property/property-summary"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="view">
                                        <Property_summary />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/property-listing"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="view">
                                        <PropertyListing />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/all-property-units"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="view">
                                        <UnitListing />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/view-property/:property_id"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="view">
                                        <Property />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/single-unit/:unit_id"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="view">
                                        <Unit />
                                    </ProtectedRoute>
                                }
                            />


                            <Route
                                path="/property/revenue-breakdown"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="view">
                                        <RevenueBreakdown />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/payment-history"
                                element={
                                    <ProtectedRoute requiredModule="properties" requiredAction="view">
                                        <PaymentHistory />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/unit/tenant-history/:unit_id"
                                element={
                                    <ProtectedRoute requiredModule="tenants" requiredAction="view">
                                        <TenantHistory />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/help-center"
                                element={
                                    <ProtectedRoute>
                                        <HelpCenter />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard/reports"
                                element={
                                    <ProtectedRoute>
                                        <Reports />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard/reports/revenue-breakdown"
                                element={
                                    <ProtectedRoute>
                                        <MonthlyRevenueBreakdown />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard/due-rent"
                                element={
                                    <ProtectedRoute requiredModule="tenants" requiredAction="view">
                                        <DueRent />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings"
                                element={
                                    <ProtectedRoute requiredModule="settings" requiredAction="view">
                                        <Settings />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/recycle"
                                element={
                                    <ProtectedRoute requiredModule="trash" requiredAction="view">
                                        <Recycle />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/landlords"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="view">
                                        <ViewLandlord />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/landlords/view-landlord/:landlord_id"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="view">
                                        <LandlordSingleView />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-landlord/personal-information"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="add">
                                        <AddLandlordPersonalInfo />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-landlord/payment-details"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="add">
                                        <AddLandlordPaymentsDetails />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-landlord/personal-information/"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="edit">
                                        <EditLandlordPersonalInfo />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-landlord/payment-details/"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="edit">
                                        <EditLandlordPaymentsDetails />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tenants/add-personal-details"
                                element={
                                    <ProtectedRoute requiredModule="tenants" requiredAction="add">
                                        <Add_Personal_Info />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tenants/add-tenant-unit"
                                element={
                                    <ProtectedRoute requiredModule="tenants" requiredAction="add">
                                        <AddTenantProperty />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tenants/edit-personal-details"
                                element={
                                    <ProtectedRoute requiredModule="tenants" requiredAction="edit">
                                        <EditPersonalInfo />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tenants/edit-tenant-unit"
                                element={
                                    <ProtectedRoute requiredModule="tenants" requiredAction="edit">
                                        <EditTenantProperty />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tenants"
                                element={
                                    <ProtectedRoute requiredModule="tenants" requiredAction="view">
                                        <Tenants />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tenants/view-tenant-units"
                                element={
                                    <ProtectedRoute requiredModule="tenants" requiredAction="view">
                                        <TenantUnits />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/receive-payment"
                                element={
                                    <ProtectedRoute requiredModule="payments" requiredAction="add">
                                        <ReceivePayment />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/receive-water"
                                element={
                                    <ProtectedRoute requiredModule="payments" requiredAction="add">
                                        <BulkWaterBill />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/receive-bulk-electricity"
                                element={
                                    <ProtectedRoute requiredModule="payments" requiredAction="add">
                                        <ReceiveElectricityBilling />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/payments/payments-received"
                                element={
                                    <ProtectedRoute requiredModule="payments" requiredAction="view">
                                        <PaymentsReceived />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/payments/payments-arrears"
                                element={
                                    <ProtectedRoute requiredModule="payments" requiredAction="view">
                                        <ArrearsDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/payments/expenses"
                                element={
                                    <ProtectedRoute requiredModule="payments" requiredAction="view">
                                        <EventsListing />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/payments/add-event"
                                element={
                                    <ProtectedRoute requiredModule="payments" requiredAction="view">
                                        <AddEvent />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/property/market-unit"
                                element={
                                    <ProtectedRoute>
                                        <MarketUnit />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings/payment_details"
                                element={
                                    <ProtectedRoute requiredModule="settings" requiredAction="add">
                                        <PaymentsDetails />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/settings/make-paybill-pdf"
                                element={
                                    <ProtectedRoute>
                                        <MakePaybillPdf />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/staffs/staff-listings"
                                element={
                                    <ProtectedRoute requiredModule="users" requiredAction="view">
                                        <Users />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/staffs/view-profile"
                                element={
                                    <ProtectedRoute requiredModule="users" requiredAction="view">
                                        <SingleStaffPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/staffs/add-personal-info"
                                element={
                                    <ProtectedRoute requiredModule="users" requiredAction="add">
                                        <AddPersonalInfo />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/staffs/edit-personal-info"
                                element={
                                    <ProtectedRoute requiredModule="users" requiredAction="edit">
                                        <EditStaffInfo />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/staffs/add-properties-and-assign-permissions"
                                element={
                                    <ProtectedRoute requiredModule="users" requiredAction="add">
                                        <AddPropertiesAssignPermissions />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/staffs/assign-properties"
                                element={
                                    <ProtectedRoute requiredModule="users" requiredAction="add">
                                        <EditStaffProperties />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/staffs/assign-permissions"
                                element={
                                    <ProtectedRoute requiredModule="users" requiredAction="add">
                                        <EditStaffPermissions />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard/inquiries"
                                element={
                                    <ProtectedRoute>
                                        <Inquiries />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard/inquiries/chatroom"
                                element={
                                    <ProtectedRoute>
                                        <ChatRoom />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/loans/view-loans"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="edit">
                                        <LoansDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/loans/loans-payments"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="edit">
                                        <LoanPayment />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/loans/view-loan-details"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="edit">
                                        <LoanDetails />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/loans/make-loan-application"
                                element={
                                    <ProtectedRoute requiredModule="landlords" requiredAction="edit">
                                        <NewLoanApplication />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/payments/transfer"
                                element={
                                    <ProtectedRoute requiredModule="payments" requiredAction="edit">
                                        <TransferPayment />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>
                    </Routes>
                </main>
            </Router>
        </AuthProvider>
    );
};

export default App;