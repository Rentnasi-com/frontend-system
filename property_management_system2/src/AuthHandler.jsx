import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAuthToken } from './store/authActions';
import toast from "react-hot-toast";

const AuthHandler = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const isMountedRef = useRef(true);
  const intervalRef = useRef(null);

  // Cleanup function
  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Safe state update helper
  const safeSetState = (callback) => {
    if (isMountedRef.current) {
      callback();
    }
  };

  // Redirect to auth service
  const redirectToAuth = (message = "Redirecting to authentication...") => {
    toast.error(message);
    setTimeout(() => {
      window.location.href = "https://auth.rentnasi.com";
    }, 1000);
  };

  // Clear user session
  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiry');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userId');
    dispatch(setAuthToken(null));
  };

  // Check if token is expired
  const isTokenExpired = (expiry) => {
    if (!expiry) return true;
    const now = Date.now();
    const tokenExpiry = new Date(expiry).getTime();
    return tokenExpiry <= now;
  };

  // Refresh token with proper async handling
  const refreshToken = async (token, baseUrl) => {
    try {
      const response = await axios.post(
        `${baseUrl}/auth/refresh-token`,
        { refreshToken: token },
        { 
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 10000 // 10 second timeout
        }
      );

      const newToken = response.data?.data?.token;
      const newExpiry = response.data?.data?.expiry;

      if (newToken && newExpiry) {
        localStorage.setItem('token', newToken);
        localStorage.setItem('expiry', newExpiry);
        dispatch(setAuthToken(newToken));
        return { success: true, token: newToken, expiry: newExpiry };
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { success: false, error };
    }
  };

  // Validate and refresh token if needed
  const validateToken = async () => {
    const token = localStorage.getItem('token');
    const expiry = localStorage.getItem('expiry');
    const baseUrl = import.meta.env.VITE_BASE_URL;

    if (!token || !expiry) {
      return { isValid: false, needsAuth: true };
    }

    if (!isTokenExpired(expiry)) {
      return { isValid: true };
    }

    // Token is expired, try to refresh
    const refreshResult = await refreshToken(token, baseUrl);
    
    if (refreshResult.success) {
      return { isValid: true, refreshed: true };
    } else {
      clearSession();
      return { isValid: false, needsAuth: true };
    }
  };

  // Check package expiry with better error handling
  const checkPackageExpiry = (packageExpiryDate) => {
    if (!packageExpiryDate) {
      console.warn('No package expiry date provided');
      return true; // Allow access if no expiry date
    }
    
    try {
      const now = new Date();
      const packageExpiry = new Date(packageExpiryDate);
      
      // Add some buffer (1 minute) to handle timezone/sync issues
      const bufferTime = 60 * 1000; // 1 minute in milliseconds
      const effectiveExpiry = new Date(packageExpiry.getTime() + bufferTime);
      
      console.log('Package expiry check:', {
        now: now.toISOString(),
        packageExpiry: packageExpiry.toISOString(),
        effectiveExpiry: effectiveExpiry.toISOString(),
        isExpired: effectiveExpiry <= now
      });

      if (effectiveExpiry <= now) {
        const sessionId = localStorage.getItem('sessionId');
        const userId = localStorage.getItem('userId');
        toast.error("Your package has expired. Redirecting to billing...");
        setTimeout(() => {
          window.location.href = `https://billing.rentalpay.africa?sessionId=${sessionId}&userId=${userId}`;
        }, 1000);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking package expiry:', error);
      // If we can't parse the date, allow access but log the error
      return true;
    }
  };

  // Authenticate with session
  const authenticateWithSession = async (sessionId, userId) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const appUrl = "https://property.rentnasi.com";

    try {
      const response = await axios.post(
        `${baseUrl}/auth`,
        { sessionId, userId, appUrl },
        { timeout: 15000 } // 15 second timeout
      );

      const token = response.data?.data?.token;
      const expiry = response.data?.data?.expiry;
      const packageExpiryDate = response.data?.package?.expiry_date;

      if (!token || !expiry) {
        throw new Error('Invalid authentication response');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('expiry', expiry);
      dispatch(setAuthToken(token));

      // Store package information for debugging
      if (response.data?.package) {
        localStorage.setItem('packageInfo', JSON.stringify(response.data.package));
        console.log('Package info from auth:', response.data.package);
      }

      if (!checkPackageExpiry(packageExpiryDate)) {
        return;
      }

      if (packageExpiryDate) {
        localStorage.setItem('packageExpiry', packageExpiryDate);
      }

      safeSetState(() => {
        toast.success("Authentication successful");
        navigate('/dashboard');
      });

    } catch (error) {
      console.error('Error during authentication:', error);
      
      // Handle specific 403 errors
      if (error.response?.status === 403) {
        const errorData = error.response.data;
        console.log('403 Error details:', errorData);
        
        if (errorData?.error?.includes('Package has expired')) {
          toast.error("Package has expired. Redirecting to billing...");
          const sessionId = localStorage.getItem('sessionId');
          const userId = localStorage.getItem('userId');
          setTimeout(() => {
            window.location.href = `https://billing.rentalpay.africa?sessionId=${sessionId}&userId=${userId}`;
          }, 1000);
          return;
        }
      }
      
      clearSession();
      redirectToAuth("Authentication failed");
    }
  };

  // Handle network changes
  const handleNetworkChange = () => {
    if (!navigator.onLine) {
      toast.error("Network connection lost");
      // Don't immediately log out on offline - user might come back online
    } else {
      // User has regained connection - validate token
      validateToken().then(result => {
        if (!result.isValid && isMountedRef.current) {
          clearSession();
          redirectToAuth("Session expired after network reconnection");
        }
      });
    }
  };

  // Set up periodic token validation
  const setupTokenValidation = () => {
    // Clear any existing interval
    cleanup();
    
    intervalRef.current = setInterval(async () => {
      if (!isMountedRef.current) return;
      
      const result = await validateToken();
      if (!result.isValid) {
        console.warn("Token expired during session. Logging out.");
        clearSession();
        safeSetState(() => {
          redirectToAuth("Session expired");
        });
        cleanup();
      }
    }, 10 * 60 * 1000); // Check every 10 minutes
  };

  useEffect(() => {
    const initialize = async () => {
      if (isProcessing) return;
      
      safeSetState(() => setIsProcessing(true));

      try {
        const queryParams = new URLSearchParams(location.search);
        const sessionId = queryParams.get('sessionId');
        const userId = queryParams.get('userId');

        // Store session info if provided
        if (sessionId && userId) {
          localStorage.setItem('sessionId', sessionId);
          localStorage.setItem('userId', userId);
        }

        // Validate existing token first
        const tokenValidation = await validateToken();

        if (tokenValidation.isValid) {
          if (tokenValidation.refreshed) {
            toast.success("Session refreshed successfully");
          } else {
            toast.success("Welcome back!");
          }
          safeSetState(() => navigate('/dashboard'));
          setupTokenValidation();
        } else if (sessionId && userId) {
          // No valid token but we have session info
          await authenticateWithSession(sessionId, userId);
          setupTokenValidation();
        } else {
          // No valid token and no session info
          clearSession();
          redirectToAuth("Invalid session");
        }
      } catch (error) {
        console.error('Initialization error:', error);
        clearSession();
        safeSetState(() => {
          redirectToAuth("Authentication error occurred");
        });
      } finally {
        safeSetState(() => setIsProcessing(false));
      }
    };

    initialize();

    // Set up network change listeners
    window.addEventListener('offline', handleNetworkChange);
    window.addEventListener('online', handleNetworkChange);

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      cleanup();
      window.removeEventListener('offline', handleNetworkChange);
      window.removeEventListener('online', handleNetworkChange);
    };
  }, [dispatch, location, navigate]); // Dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div>Authenticating...</div>
      {isProcessing && <div style={{ fontSize: '0.8rem', color: '#666' }}>Please wait...</div>}
    </div>
  );
};

export default AuthHandler;