export const SET_AUTH_TOKEN = 'SET_AUTH_TOKEN';

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);  // Save token to localStorage
  return {
    type: SET_AUTH_TOKEN,
    payload: token,
  };
};
