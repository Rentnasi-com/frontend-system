import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('userDetails') || 'null'),
    packageInfo: JSON.parse(localStorage.getItem('packageInfo') || 'null'),
    orgDetails: JSON.parse(localStorage.getItem('orgDetails') || 'null'),
    roles: JSON.parse(localStorage.getItem('roles') || '[]'),
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set loading state
        setLoading: (state, action) => {
            state.loading = action.payload;
            state.error = null;
        },

        // Set error state
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },

        // Login success - set all auth data
        loginSuccess: (state, action) => {
            const { token, expiry, user, packageInfo, orgDetails, roles } = action.payload;

            state.token = token;
            state.isAuthenticated = true;
            state.user = user;
            state.packageInfo = packageInfo;
            state.orgDetails = orgDetails;
            state.roles = roles || [];
            state.loading = false;
            state.error = null;

            // Save to localStorage
            localStorage.setItem('token', token);
            if (expiry) localStorage.setItem('expiry', expiry);
            if (user) localStorage.setItem('userDetails', JSON.stringify(user));
            if (packageInfo) {
                localStorage.setItem('packageInfo', JSON.stringify(packageInfo));
                localStorage.setItem('packageExpiry', packageInfo.package_expires_at || '');
            }
            if (orgDetails) localStorage.setItem('orgDetails', JSON.stringify(orgDetails));
            if (roles) localStorage.setItem('roles', JSON.stringify(roles));
        },

        // Update just the token (for refresh)
        updateToken: (state, action) => {
            const { token, expiry } = action.payload;
            state.token = token;
            state.isAuthenticated = true;
            state.error = null;

            localStorage.setItem('token', token);
            if (expiry) localStorage.setItem('expiry', expiry);
        },

        // Update user info
        updateUser: (state, action) => {
            state.user = action.payload;
            localStorage.setItem('userDetails', JSON.stringify(action.payload));
        },

        // Update package info
        updatePackage: (state, action) => {
            state.packageInfo = action.payload;
            localStorage.setItem('packageInfo', JSON.stringify(action.payload));
            if (action.payload?.package_expires_at) {
                localStorage.setItem('packageExpiry', action.payload.package_expires_at);
            }
        },

        // Update organization details
        updateOrgDetails: (state, action) => {
            state.orgDetails = action.payload;
            localStorage.setItem('orgDetails', JSON.stringify(action.payload));
        },

        // Complete logout - clear everything
        logout: (state) => {
            state.token = null;
            state.isAuthenticated = false;
            state.user = null;
            state.packageInfo = null;
            state.orgDetails = null;
            state.roles = [];
            state.loading = false;
            state.error = null;

            // Clear localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('expiry');
            localStorage.removeItem('sessionId');
            localStorage.removeItem('userId');
            localStorage.removeItem('packageInfo');
            localStorage.removeItem('packageExpiry');
            localStorage.removeItem('userDetails');
            localStorage.removeItem('orgDetails');
            localStorage.removeItem('roles');
        },

        // Clear error
        clearError: (state) => {
            state.error = null;
        },
    },
});

// Export actions
export const {
    setLoading,
    setError,
    loginSuccess,
    updateToken,
    updateUser,
    updatePackage,
    updateOrgDetails,
    logout,
    clearError,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUser = (state) => state.auth.user;
export const selectPackageInfo = (state) => state.auth.packageInfo;
export const selectOrgDetails = (state) => state.auth.orgDetails;
export const selectRoles = (state) => state.auth.roles;
export const selectLoading = (state) => state.auth.loading;
export const selectError = (state) => state.auth.error;

export default authSlice.reducer;