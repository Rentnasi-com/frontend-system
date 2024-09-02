import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) {
      window.location.href = "http://localhost:5173";
    }
  }, [token]);

  return token ? children : null;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
