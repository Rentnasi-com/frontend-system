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
      // window.location.href = "https://auth.rentalpay.africa/sign-in";
    }, 1000);
  };

  // Clear user session
  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('expiry');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('userId');
    localStorage.removeItem('packageInfo');
    localStorage.removeItem('packageExpiry');
    localStorage.removeItem('userDetails');
    dispatch(setAuthToken(null));
  };

  // Check if token is expired
  const isTokenExpired = (expiry) => {
    if (!expiry) return true;
    const now = Date.now();
    // Handle the timestamp format from the API (e.g., "20250707055401000000")
    let tokenExpiry;
    if (typeof expiry === 'string' && expiry.length === 20) {
      // Parse the timestamp format: YYYYMMDDHHMMSSSSSSSS
      const year = parseInt(expiry.substring(0, 4));
      const month = parseInt(expiry.substring(4, 6)) - 1; // Month is 0-indexed
      const day = parseInt(expiry.substring(6, 8));
      const hour = parseInt(expiry.substring(8, 10));
      const minute = parseInt(expiry.substring(10, 12));
      const second = parseInt(expiry.substring(12, 14));
      tokenExpiry = new Date(year, month, day, hour, minute, second).getTime();
    } else {
      tokenExpiry = new Date(expiry).getTime();
    }
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

      // Updated to handle new response structure
      const newToken = response.data?.data?.authorization?.token;
      const newExpiry = response.data?.data?.authorization?.expires_at;

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

  // Parse package expiry date from the API format - FIXED VERSION
  const parsePackageExpiryDate = (packageExpiryString) => {
    if (!packageExpiryString || typeof packageExpiryString !== 'string') {
      console.log('No package expiry string provided:', packageExpiryString);
      return null;
    }

    try {
      // Handle the timestamp format: YYYYMMDDHHMMSSSSSSSS
      if (packageExpiryString.length === 20) {
        const year = parseInt(packageExpiryString.substring(0, 4));
        const month = parseInt(packageExpiryString.substring(4, 6)) - 1; // Month is 0-indexed
        const day = parseInt(packageExpiryString.substring(6, 8));
        const hour = parseInt(packageExpiryString.substring(8, 10));
        const minute = parseInt(packageExpiryString.substring(10, 12));
        const second = parseInt(packageExpiryString.substring(12, 14));

        const parsedDate = new Date(year, month, day, hour, minute, second);
        console.log('Parsed package expiry date:', parsedDate.toISOString());
        return parsedDate;
      }

      // Fallback to regular date parsing
      const fallbackDate = new Date(packageExpiryString);
      console.log('Fallback parsed package expiry date:', fallbackDate.toISOString());
      return fallbackDate;
    } catch (error) {
      console.error('Error parsing package expiry date:', error, 'Input:', packageExpiryString);
      return null;
    }
  };

  // IMPROVED: Check package expiry with better error handling and debugging
  const checkPackageExpiry = (packageData) => {
    console.log('=== PACKAGE EXPIRY CHECK START ===');
    console.log('Package data received:', packageData);

    if (!packageData) {
      console.warn('No package data provided - allowing access');
      return true; // Allow access if no package data
    }

    // Check if package is already marked as expired
    if (packageData.package_expired === true) {
      console.log('Package is marked as expired in the response');
      const sessionId = localStorage.getItem('sessionId');
      const userId = localStorage.getItem('userId');
      toast.error("Your package has expired. Redirecting to billing...");
      setTimeout(() => {
        window.location.href = `https://billing.rentalpay.africa?sessionId=${sessionId}&userId=${userId}`;
      }, 1000);
      return false;
    }

    const packageExpiryString = packageData.package_expires_at;
    console.log('Package expires at string:', packageExpiryString);

    if (!packageExpiryString) {
      console.warn('No package expiry date provided - allowing access');
      return true; // Allow access if no expiry date
    }

    try {
      const now = new Date();
      const packageExpiry = parsePackageExpiryDate(packageExpiryString);

      if (!packageExpiry || isNaN(packageExpiry.getTime())) {
        console.error('Invalid package expiry date:', packageExpiryString);
        console.warn('Cannot parse expiry date - allowing access for safety');
        return true; // Allow access if we can't parse the date
      }

      // INCREASED buffer time to handle timezone/sync issues
      const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
      const effectiveExpiry = new Date(packageExpiry.getTime() + bufferTime);

      const logData = {
        now: now.toISOString(),
        packageExpiry: packageExpiry.toISOString(),
        effectiveExpiry: effectiveExpiry.toISOString(),
        isExpired: effectiveExpiry <= now,
        timeDifference: effectiveExpiry.getTime() - now.getTime(),
        timeDifferenceHours: (effectiveExpiry.getTime() - now.getTime()) / (1000 * 60 * 60),
        packageData
      };

      console.log('Package expiry check details:', logData);

      if (effectiveExpiry <= now) {
        console.log('PACKAGE EXPIRED - Redirecting to billing');
        const sessionId = localStorage.getItem('sessionId');
        const userId = localStorage.getItem('userId');
        toast.error("Your package has expired. Redirecting to billing...");
        setTimeout(() => {
          window.location.href = `https://billing.rentalpay.africa?sessionId=${sessionId}&userId=${userId}`;
        }, 1000);
        return false;
      }

      console.log('PACKAGE IS VALID - Allowing access');
      console.log('=== PACKAGE EXPIRY CHECK END ===');
      return true;
    } catch (error) {
      console.error('Error checking package expiry:', error);
      console.warn('Error occurred - allowing access for safety');
      // If we can't parse the date, allow access but log the error
      return true;
    }
  };

  // IMPROVED: Authenticate with session - added better debugging
  const authenticateWithSession = async (sessionId, userId) => {
    const baseUrl = import.meta.env.VITE_BASE_URL;
    const appUrl = "https://property.rentnasi.com";

    console.log('=== AUTHENTICATION START ===');
    console.log('Session ID:', sessionId);
    console.log('User ID:', userId);
    console.log('Base URL:', baseUrl);

    try {
      const response = await axios.post(
        `${baseUrl}/v2/apps/authenticate`,
        { sessionId, userId, appUrl },
        { timeout: 15000 } // 15 second timeout
      );

      console.log('Full authentication response:', response);
      console.log('Response data:', response.data);

      // Updated to handle new response structure
      const responseData = response.data?.data;
      const token = responseData?.authorization?.token;
      const expiry = responseData?.authorization?.expires_at;
      const packageData = responseData?.packages;
      const userDetails = responseData?.user_details;

      console.log('Extracted data:', {
        token: token ? 'Present' : 'Missing',
        expiry: expiry ? 'Present' : 'Missing',
        packageData,
        userDetails: userDetails ? 'Present' : 'Missing'
      });

      if (!token || !expiry) {
        throw new Error('Invalid authentication response - missing token or expiry');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('expiry', expiry);
      dispatch(setAuthToken(token));

      // Store user details
      if (userDetails) {
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        console.log('User details stored:', userDetails);
      }

      // Store package information
      if (packageData) {
        localStorage.setItem('packageInfo', JSON.stringify(packageData));
        localStorage.setItem('packageExpiry', packageData.package_expires_at || '');
        console.log('Package info stored:', packageData);
      }

      console.log('=== STARTING PACKAGE EXPIRY CHECK ===');
      // Check package expiry - THIS IS WHERE THE ISSUE MIGHT BE
      const packageIsValid = checkPackageExpiry(packageData);

      if (!packageIsValid) {
        console.log('Package check failed - stopping authentication flow');
        return; // This will cause immediate redirect to billing
      }

      console.log('Package check passed - proceeding to dashboard');
      safeSetState(() => {
        toast.success("Authentication successful");
        navigate('/dashboard');
      });

    } catch (error) {
      console.error('Error during authentication:', error);
      console.log('Error response:', error.response);

      // Handle specific 403 errors
      if (error.response?.status === 403) {
        const errorData = error.response.data;
        console.log('403 Error details:', errorData);

        if (errorData?.error?.includes('Package has expired') ||
          errorData?.message?.includes('package') ||
          errorData?.message?.includes('expired')) {
          toast.error("Package has expired. Redirecting to billing...");
          const sessionId = localStorage.getItem('sessionId');
          const userId = localStorage.getItem('userId');
          setTimeout(() => {
            window.location.href = `https://billing.rentalpay.africa?sessionId=${sessionId}&userId=${userId}`;
          }, 1000);
          return;
        }
      }

      // Handle other error status codes
      if (error.response?.status === 401) {
        toast.error("Invalid credentials. Please sign in again.");
      } else if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else if (error.code === 'ECONNABORTED') {
        toast.error("Request timeout. Please check your connection.");
      } else {
        toast.error("Authentication failed. Please try again.");
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

        console.log('=== INITIALIZATION START ===');
        console.log('URL params - sessionId:', sessionId, 'userId:', userId);

        // Store session info if provided
        if (sessionId && userId) {
          localStorage.setItem('sessionId', sessionId);
          localStorage.setItem('userId', userId);
          console.log('Session info stored in localStorage');
        }

        // Validate existing token first
        console.log('Validating existing token...');
        const tokenValidation = await validateToken();
        console.log('Token validation result:', tokenValidation);

        if (tokenValidation.isValid) {
          if (tokenValidation.refreshed) {
            toast.success("Session refreshed successfully");
          } else {
            toast.success("Welcome back!");
          }
          console.log('Valid token found - navigating to dashboard');
          safeSetState(() => navigate('/dashboard'));
          setupTokenValidation();
        } else if (sessionId && userId) {
          // No valid token but we have session info
          console.log('No valid token - authenticating with session');
          await authenticateWithSession(sessionId, userId);
          setupTokenValidation();
        } else {
          // No valid token and no session info
          console.log('No valid token or session info - clearing session');
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