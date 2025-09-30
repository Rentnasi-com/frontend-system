import { combineReducers } from '@reduxjs/toolkit';
import authReducer from './authSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  // Add other slices here as you create them
  // user: userReducer,
  // properties: propertiesReducer,
});

export default rootReducer;