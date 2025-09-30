import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './index';

const store = configureStore({
  reducer: rootReducer,
  // Redux Toolkit includes good defaults, but you can customize:
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  // Enable Redux DevTools in development
  // devTools: process.env.NODE_ENV !== 'production',
});

export default store;