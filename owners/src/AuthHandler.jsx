import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { setAuthToken } from './store/authActions';

const AuthHandler = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get('sessionId');
    const userId = queryParams.get('userId');
    const token = localStorage.getItem('token')

    localStorage.setItem("sessionId", sessionId)
    localStorage.setItem("userId", userId)

    if (token) {
      navigate("/dashboard")
    }
    else if (sessionId && userId) {
      const appUrl = "https://myaccount.rentnasi.com"

      axios.post('https://auth.api.rentnasi.com/v2/apps/authenticate', { sessionId, userId, appUrl })
        .then(response => {
          console.log(response)
          const token = response.data.data.authorization.token;
          localStorage.setItem("token", token)
          dispatch(setAuthToken(token));
          navigate('/dashboard');
        })
        .catch(error => {
          console.error('Error during authentication:', error);
          // window.location.href = "http://localhost:5173"
          // window.location.href="https://auth.rentnasi.com"
        });
    } else {
      // window.href.location = "http://localhost:5173"
      // window.location.href="https://auth.rentnasi.com"
    }
  }, [dispatch, location, navigate]);

  return (
    <>
      <h1 className="text-sm">Loading</h1>
    </>
  );  // You can show a loader here
};

export default AuthHandler;
