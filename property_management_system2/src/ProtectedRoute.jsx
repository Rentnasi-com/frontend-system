import { useAuth } from './AuthContext';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children, requiredModule, requiredAction }) => {
    const { isAuthenticated, loading, hasPermission } = useAuth();

    // Show loading while checking auth
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        window.location.href = "https://auth.rentalpay.africa/sign-in";
        return null;
    }

    // Check specific permissions if required
    if (requiredModule && requiredAction) {
        if (!hasPermission(requiredModule, requiredAction)) {
            return (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    flexDirection: 'column'
                }}>
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access this resource.</p>
                </div>
            );
        }
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredModule: PropTypes.string,
    requiredAction: PropTypes.string,
};

export default ProtectedRoute;