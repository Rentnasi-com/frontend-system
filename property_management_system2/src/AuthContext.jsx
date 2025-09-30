import { createContext, useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [permissions, setPermissions] = useState([]);
    const [packageInfo, setPackageInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const refreshTimeoutRef = useRef(null);
    const interceptorsSetRef = useRef(false);

    const baseUrl = import.meta.env.VITE_BASE_URL;

    // Clear all auth data
    const clearAuth = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('expiry');
        localStorage.removeItem('sessionId');
        localStorage.removeItem('userId');
        localStorage.removeItem('packageInfo');
        localStorage.removeItem('packageExpiry');
        localStorage.removeItem('permissions');

        setToken(null);
        setUser(null);
        setPermissions([]);
        setPackageInfo(null);
        setIsAuthenticated(false);

        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }
    };

    // Check if token is expired
    const isTokenExpired = (expiry) => {
        if (!expiry) return true;
        return new Date(expiry).getTime() <= Date.now();
    };

    // Redirect to auth
    const redirectToAuth = (message = "Please login") => {
        toast.error(message);
        clearAuth();
        setTimeout(() => {
            window.location.href = "https://auth.rentalpay.africa/sign-in";
        }, 1000);
    };

    // Redirect to billing
    const redirectToBilling = () => {
        const sessionId = localStorage.getItem('sessionId');
        const userId = localStorage.getItem('userId');
        toast.error("Package expired. Redirecting to billing...");
        setTimeout(() => {
            window.location.href = `https://billing.rentalpay.africa?sessionId=${sessionId}&userId=${userId}`;
        }, 1000);
    };

    // Refresh token
    const refreshToken = async () => {
        const currentToken = localStorage.getItem('token');
        if (!currentToken) return false;

        try {
            const response = await axios.post(`${baseUrl}/auth/refresh-token`, {
                refreshToken: currentToken
            }, {
                headers: { Authorization: `Bearer ${currentToken}` }
            });

            const { token: newToken, expiry } = response.data.data;

            localStorage.setItem('token', newToken);
            localStorage.setItem('expiry', expiry);
            setToken(newToken);

            // Schedule next refresh before expiry
            scheduleTokenRefresh(expiry);

            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            redirectToAuth("Session expired");
            return false;
        }
    };

    // Schedule automatic token refresh
    const scheduleTokenRefresh = (expiry) => {
        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
        }

        const expiryTime = new Date(expiry).getTime();
        const now = Date.now();
        const timeUntilRefresh = expiryTime - now - (5 * 60 * 1000); // Refresh 5 mins before expiry

        if (timeUntilRefresh > 0) {
            refreshTimeoutRef.current = setTimeout(refreshToken, timeUntilRefresh);
        }
    };

    // Authenticate with sessionId and userId
    const authenticateWithSession = async (sessionId, userId) => {
        try {
            setLoading(true);

            const response = await axios.post(`${baseUrl}/auth`, {
                sessionId,
                userId,
                appUrl: "https://property.rentnasi.com"
            });

            const { data, package: packageData, permissions: userPermissions } = response.data;

            // Store auth data
            localStorage.setItem('token', data.token);
            localStorage.setItem('expiry', data.expiry);
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('userId', userId);

            setToken(data.token);
            setIsAuthenticated(true);

            // Handle package info
            if (packageData) {
                localStorage.setItem('packageInfo', JSON.stringify(packageData));
                localStorage.setItem('packageExpiry', packageData.expiry_date);
                setPackageInfo(packageData);

                // Check if package is expired
                const packageExpiry = new Date(packageData.expiry_date);
                if (packageExpiry <= new Date()) {
                    redirectToBilling();
                    return;
                }
            }

            // Handle permissions
            if (userPermissions) {
                localStorage.setItem('permissions', JSON.stringify(userPermissions));
                setPermissions(userPermissions);
            }

            // Schedule token refresh
            scheduleTokenRefresh(data.expiry);

            toast.success("Authentication successful");
            return true;

        } catch (error) {
            console.error('Authentication error:', error);

            if (error.response?.status === 403 &&
                error.response?.data?.error?.includes('Package has expired')) {
                redirectToBilling();
                return;
            }

            redirectToAuth("Authentication failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Check if user has permission
    const hasPermission = (module, action) => {
        if (!permissions.length) return false;

        const modulePermission = permissions.find(p => p.module === module);
        return modulePermission?.actions?.includes(action) || false;
    };

    // Logout
    const logout = () => {
        clearAuth();
        toast.success("Logged out successfully");
        window.location.href = "https://auth.rentalpay.africa/sign-in";
    };

    // Setup axios interceptors
    useEffect(() => {
        if (interceptorsSetRef.current) return;

        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const currentToken = localStorage.getItem('token');
                if (currentToken && !config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${currentToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    redirectToAuth("Session expired");
                } else if (error.response?.status === 403 &&
                    error.response?.data?.error?.includes('Package has expired')) {
                    redirectToBilling();
                }
                return Promise.reject(error);
            }
        );

        interceptorsSetRef.current = true;

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
            interceptorsSetRef.current = false;
        };
    }, []);

    // Initialize auth on mount
    useEffect(() => {
        const initAuth = async () => {
            // Check URL params first (always save new sessionId/userId if present)
            const urlParams = new URLSearchParams(window.location.search);
            const urlSessionId = urlParams.get('sessionId');
            const urlUserId = urlParams.get('userId');

            if (urlSessionId && urlUserId) {
                // New session parameters - authenticate regardless of existing token
                await authenticateWithSession(urlSessionId, urlUserId);
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
                return;
            }

            // Check existing token
            const existingToken = localStorage.getItem('token');
            const expiry = localStorage.getItem('expiry');

            if (!existingToken || !expiry) {
                setLoading(false);
                return;
            }

            if (isTokenExpired(expiry)) {
                // Try to refresh
                const refreshed = await refreshToken();
                if (!refreshed) {
                    setLoading(false);
                    return;
                }
            }

            // Load existing data
            const storedPackage = localStorage.getItem('packageInfo');
            const storedPermissions = localStorage.getItem('permissions');

            if (storedPackage) {
                const packageData = JSON.parse(storedPackage);
                setPackageInfo(packageData);

                // Check package expiry
                if (new Date(packageData.expiry_date) <= new Date()) {
                    redirectToBilling();
                    return;
                }
            }

            if (storedPermissions) {
                setPermissions(JSON.parse(storedPermissions));
            }

            setToken(existingToken);
            setIsAuthenticated(true);
            scheduleTokenRefresh(expiry);
            setLoading(false);
        };

        initAuth();

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }
        };
    }, []);

    const value = {
        user,
        token,
        permissions,
        packageInfo,
        loading,
        isAuthenticated,
        hasPermission,
        logout,
        clearAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};