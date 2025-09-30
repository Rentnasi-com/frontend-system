import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    setLoading,
    setError,
    loginSuccess,
    updateToken,
    logout,
    selectToken,
    selectIsAuthenticated,
} from './store/authSlice';
import toast from "react-hot-toast";

const AuthHandler = () => {
    const dispatch = useDispatch();
    const location = useLocation();
    const navigate = useNavigate();

    const token = useSelector(selectToken);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const [isProcessing, setIsProcessing] = useState(false);
    const isMountedRef = useRef(true);
    const intervalRef = useRef(null);

    // App URL - make sure this matches your actual domain
    const APP_URL = "http://localhost:5180"; // Update this to your actual app URL
    const API_BASE_URL = "https://auth2.api.rentalpay.africa"; // Updated to match your endpoint

    // Cleanup intervals
    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    // Safe state updates
    const safeSetState = (callback) => {
        if (isMountedRef.current) {
            callback();
        }
    };

    // Redirect to auth service
    const redirectToAuth = (message = "Redirecting to authentication...") => {
        toast.error(message);
        setTimeout(() => {
            window.location.href = "https://auth.rentalpay.africa/sign-in";
        }, 1000);
    };

    // Check if token is expired
    const isTokenExpired = (expiry) => {
        if (!expiry) return true;

        const now = Date.now();
        let tokenExpiry;

        if (typeof expiry === 'string' && expiry.length === 20) {
            // Parse format: YYYYMMDDHHMMSSSSSSSS
            const year = parseInt(expiry.substring(0, 4));
            const month = parseInt(expiry.substring(4, 6)) - 1;
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

    // Refresh token
    const refreshToken = async (currentToken) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/refresh-token`,
                { refreshToken: currentToken },
                {
                    headers: { 'Authorization': `Bearer ${currentToken}` },
                    timeout: 10000
                }
            );

            const newToken = response.data?.data?.authorization?.token;
            const newExpiry = response.data?.data?.authorization?.expires_at;

            if (newToken && newExpiry) {
                dispatch(updateToken({ token: newToken, expiry: newExpiry }));
                return { success: true, token: newToken, expiry: newExpiry };
            } else {
                throw new Error('Invalid refresh response');
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            return { success: false, error };
        }
    };

    // Validate existing token
    const validateToken = async () => {
        const storedToken = localStorage.getItem('token');
        const expiry = localStorage.getItem('expiry');

        if (!storedToken || !expiry) {
            return { isValid: false, needsAuth: true };
        }

        if (!isTokenExpired(expiry)) {
            return { isValid: true };
        }

        // Try to refresh
        const refreshResult = await refreshToken(storedToken);

        if (refreshResult.success) {
            return { isValid: true, refreshed: true };
        } else {
            dispatch(logout());
            return { isValid: false, needsAuth: true };
        }
    };

    // Parse package expiry
    const parsePackageExpiryDate = (packageExpiryString) => {
        if (!packageExpiryString || typeof packageExpiryString !== 'string') {
            return null;
        }

        try {
            if (packageExpiryString.length === 20) {
                const year = parseInt(packageExpiryString.substring(0, 4));
                const month = parseInt(packageExpiryString.substring(4, 6)) - 1;
                const day = parseInt(packageExpiryString.substring(6, 8));
                const hour = parseInt(packageExpiryString.substring(8, 10));
                const minute = parseInt(packageExpiryString.substring(10, 12));
                const second = parseInt(packageExpiryString.substring(12, 14));

                return new Date(year, month, day, hour, minute, second);
            }

            return new Date(packageExpiryString);
        } catch (error) {
            console.error('Error parsing package expiry date:', error);
            return null;
        }
    };

    // Check package expiry
    const checkPackageExpiry = (packageData) => {
        if (!packageData) return true;

        // Check if package is explicitly marked as expired
        if (packageData.package_expired === true) {
            const sessionId = localStorage.getItem('sessionId');
            const userId = localStorage.getItem('userId');
            toast.error("Your package has expired. Redirecting to billing...");
            setTimeout(() => {
                window.location.href = `https://billing.rentalpay.africa?sessionId=${sessionId}&userId=${userId}`;
            }, 1000);
            return false;
        }

        const packageExpiryString = packageData.package_expires_at;
        if (!packageExpiryString) return true;

        try {
            const now = new Date();
            const packageExpiry = parsePackageExpiryDate(packageExpiryString);

            if (!packageExpiry || isNaN(packageExpiry.getTime())) {
                return true;
            }

            const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
            const effectiveExpiry = new Date(packageExpiry.getTime() + bufferTime);

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
            return true;
        }
    };

    // Authenticate with session
    const authenticateWithSession = async (sessionId, userId) => {
        dispatch(setLoading(true));

        try {
            console.log('Authenticating with:', { sessionId, userId, appUrl: APP_URL });

            const response = await axios.post(
                `${API_BASE_URL}/v2/apps/authenticate`,
                {
                    sessionId,
                    userId,
                    appUrl: APP_URL
                },
                { timeout: 15000 }
            );

            console.log('Authentication response:', response.data);

            if (!response.data.success) {
                throw new Error(response.data.message || 'Authentication failed');
            }

            const responseData = response.data.data;
            const newToken = responseData.authorization?.token;
            const expiry = responseData.authorization?.expires_at;
            const packageData = responseData.packages;
            const userDetails = responseData.user_details;
            const orgDetails = responseData.org_details;
            const roles = responseData.roles;

            if (!newToken || !expiry) {
                throw new Error('Invalid authentication response: missing token or expiry');
            }

            // Check package before setting auth state
            const packageIsValid = checkPackageExpiry(packageData);
            if (!packageIsValid) {
                return;
            }

            // Store session info
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('userId', userId);

            // Update Redux state
            dispatch(loginSuccess({
                token: newToken,
                expiry,
                user: userDetails,
                packageInfo: packageData,
                orgDetails,
                roles,
            }));

            toast.success("Authentication successful");
            safeSetState(() => navigate('/dashboard'));

        } catch (error) {
            console.error('Authentication error:', error);

            // Handle specific error responses
            if (error.response?.status === 403) {
                const errorData = error.response.data;
                if (errorData?.error?.includes('Package has expired') ||
                    errorData?.message?.includes('package') ||
                    errorData?.message?.includes('expired')) {
                    toast.error("Package has expired. Redirecting to billing...");
                    const storedSessionId = localStorage.getItem('sessionId');
                    const storedUserId = localStorage.getItem('userId');
                    setTimeout(() => {
                        window.location.href = `https://billing.rentalpay.africa?sessionId=${storedSessionId}&userId=${storedUserId}`;
                    }, 1000);
                    return;
                }
            }

            // Handle different error types
            let errorMessage = "Authentication failed. Please try again.";
            if (error.response?.status === 401) {
                errorMessage = "Invalid credentials. Please sign in again.";
            } else if (error.response?.status === 500) {
                errorMessage = "Server error. Please try again later.";
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timeout. Please check your connection.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            dispatch(setError(errorMessage));
            toast.error(errorMessage);
            dispatch(logout());
            redirectToAuth("Authentication failed");
        }
    };

    // Setup periodic token validation
    const setupTokenValidation = () => {
        cleanup();
        intervalRef.current = setInterval(async () => {
            if (!isMountedRef.current) return;

            const result = await validateToken();
            if (!result.isValid) {
                console.warn("Token expired during session");
                dispatch(logout());
                safeSetState(() => {
                    redirectToAuth("Session expired");
                });
                cleanup();
            }
        }, 10 * 60 * 1000); // Every 10 minutes
    };

    // Main initialization effect
    useEffect(() => {
        const initialize = async () => {
            if (isProcessing) return;

            safeSetState(() => setIsProcessing(true));

            try {
                const queryParams = new URLSearchParams(location.search);
                const sessionId = queryParams.get('sessionId');
                const userId = queryParams.get('userId');

                console.log('URL params:', { sessionId, userId });

                // If we have URL parameters, always authenticate with them
                if (sessionId && userId) {
                    await authenticateWithSession(sessionId, userId);
                    setupTokenValidation();
                } else {
                    // Check if we have existing valid token
                    const tokenValidation = await validateToken();

                    if (tokenValidation.isValid) {
                        if (tokenValidation.refreshed) {
                            toast.success("Session refreshed successfully");
                        } else {
                            toast.success("Welcome back!");
                        }
                        safeSetState(() => navigate('/dashboard'));
                        setupTokenValidation();
                    } else {
                        dispatch(logout());
                        redirectToAuth("Please sign in to continue");
                    }
                }
            } catch (error) {
                console.error('Initialization error:', error);
                dispatch(setError("Authentication error occurred"));
                dispatch(logout());
                safeSetState(() => {
                    redirectToAuth("Authentication error occurred");
                });
            } finally {
                safeSetState(() => setIsProcessing(false));
            }
        };

        initialize();

        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, [location.search]); // Only depend on search params

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