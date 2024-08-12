import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToken } from './State/authSlice'; 
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import OAuthCallback from './Components/OAuthCallback';
import LoginPage from './Pages/LoginPage';
import ApplicationPage from './Pages/ApplicationPage';
import DashboardPage from './Pages/Dashboard';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  return (
    <div className="container">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/application/:id" element={<ApplicationPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
