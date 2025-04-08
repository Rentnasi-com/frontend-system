import { SET_AUTH_TOKEN } from './authActions';

const initialState = {
  token: localStorage.getItem('token'),  // Load token from localStorage
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_AUTH_TOKEN:
      console.log('Token set in Redux:', action.payload);  // Log the token
      return {
        ...state,
        token: action.payload,
      };
    default:
      return state;
  }
};

export default authReducer;
