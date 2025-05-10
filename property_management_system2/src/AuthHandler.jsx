import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAuthToken } from './store/authActions';
import toast from "react-hot-toast";

const AuthHandler = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('sessionId');
    const userId = queryParams.get('userId');
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('expiry');
    const baseUrl = import.meta.env.VITE_BASE_URL;
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('userId', userId);
    const appUrl = "https://property.rentnasi.com";

    const validateToken = () => {
      if (token && expiry) {
        const now = Date.now();
        const tokenExpiry = new Date(expiry).getTime();

        if (tokenExpiry > now) {
          return true;
        } else {
          axios.post(`${baseUrl}/auth/refresh-token`, { refreshToken: token }, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(response => {
              const newToken = response.data.data.token;
              const newExpiry = response.data.data.expiry;

              if (newToken && newExpiry) {
                localStorage.setItem('token', newToken);
                localStorage.setItem('expiry', newExpiry);
              } else {
                toast.error("Session expired. Please log in again.");
                // window.location.href = "https://auth.rentnasi.com";
              }
            })
            .catch(error => {
              console.error('Error refreshing token:', error);
              toast.error("Session expired. Please log in again.");
              // window.location.href = "https://auth.rentnasi.com";
            });
          return false;
        }
      }
      return false;
    };

    const checkPackageExpiry = (packageExpiryDate) => {
      const now = new Date();
      const packageExpiry = new Date(packageExpiryDate);

      if (packageExpiry <= now) {
        toast.error("Your package has expired. Redirecting to billing...");
        window.location.href = `https://billing.rentalpay.africa?sessionId=${sessionId}&userId=${userId}`;
        return false; // Package has expired
      }
      return true; // Package is still valid
    };

    const logoutUser = () => {
      toast.error("Network change detected. Logging out...");
      localStorage.removeItem('token');
      localStorage.removeItem('expiry');
      dispatch(setAuthToken(null)); // Clear token in Redux
      // window.location.href = "https://auth.rentnasi.com"; // Redirect to login page
    };

    // Set up token validation on load
    const isTokenValid = validateToken();

    if (isTokenValid) {
      toast.success("Welcome back! Token is still valid.");
      navigate('/dashboard');
    } else if (sessionId && userId) {
      axios.post(`${baseUrl}/auth`, { sessionId, userId, appUrl })
        .then(response => {
          const token = response.data.data.token;
          const expiry = response.data.data.expiry;
          const packageExpiryDate = response.data.package.expiry_date;

          localStorage.setItem('token', token);
          localStorage.setItem('expiry', expiry);

          dispatch(setAuthToken(token));

          if (!checkPackageExpiry(packageExpiryDate)) {
            return;
          } else {
            navigate('/dashboard');
            localStorage.setItem('Days remaining:', packageExpiryDate);
            toast.success("Authentication successful");
          }
        })
        .catch(error => {
          console.error('Error during authentication:', error);
          toast.error("Authentication failed. Redirecting...");
          // window.location.href = "https://auth.rentnasi.com";
        });
    } else {
      toast.error("Invalid session. Redirecting...");
      // window.location.href = "https://auth.rentnasi.com";
    }

    // Set up periodic token validity check
    const interval = setInterval(() => {
      const isStillValid = validateToken();
      if (!isStillValid) {
        console.warn("Token expired during session. Logging out.");
        toast.error("Session expired. Redirecting...");
        // window.location.href = "https://auth.rentnasi.com";
      }
    }, 10 * 60 * 1000);

    // Listen for network changes
    const handleNetworkChange = () => {
      if (!navigator.onLine) {
        // User has lost network connection, log them out
        logoutUser();
      } else {
        // User has regained network connection, redirect to auth
        // window.location.href = "https://auth.rentnasi.com";
      }
    };

    // Add event listeners for network changes
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('online', handleNetworkChange);

    // Cleanup event listeners on component unmount
    return () => {
      clearInterval(interval);
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('online', handleNetworkChange);
    };
  }, [dispatch, location, navigate]);

  return <div>Loading...</div>;
};

export default AuthHandler;