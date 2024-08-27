// OAuthCallback.js
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToken, setUserId } from '../State/authSlice';

const OAuthCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userId = urlParams.get('userId');

    if (token && userId) {
      dispatch(setToken(token));
      dispatch(setUserId(userId));
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate]);

  return null;
};

export default OAuthCallback;
