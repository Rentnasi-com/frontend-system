import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ element }) => {
  const token = useSelector((state) => state.auth.token);
  return token ? element : window.location.href = "https://auth.rentalpay.africa/sign-in";
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default ProtectedRoute;
