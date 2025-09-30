import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { selectIsAuthenticated, selectToken } from './store/authSlice';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);

  useEffect(() => {
    // If no token or not authenticated, redirect to auth service
    if (!isAuthenticated || !token) {
      window.location.href = "https://auth.rentalpay.africa";
    }
  }, [isAuthenticated, token]);

  // Show loading or nothing while redirecting
  if (!isAuthenticated || !token) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
      }}>
        <div>Redirecting to authentication...</div>
      </div>
    );
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;