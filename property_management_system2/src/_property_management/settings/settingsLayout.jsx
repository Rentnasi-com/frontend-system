import { Outlet } from 'react-router-dom';
import SettingsAside from '../../shared/settingsBreadcrumbs';
import { DashboardHeader } from '../properties/dashboard/page_components';

const SettingsLayout = () => {
    return (
        <>
            <DashboardHeader
                title="Settings Dashboard"
                description="Manage your company profile, settings, payments, and preferences"
            />

            <div className="flex gap-6 bg-gray-50 min-h-screen p-6">
                <SettingsAside />
                <div className="flex-1">
                    <Outlet />
                </div>
            </div>
        </>
    );
};

export default SettingsLayout;