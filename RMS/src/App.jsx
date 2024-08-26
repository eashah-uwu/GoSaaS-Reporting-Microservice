import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToken } from './State/authSlice';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './Components/ProtectedRoute';
import OAuthCallback from './Components/OAuthCallback';
import LoginPage from "./Pages/LoginPage.tsx"
import ApplicationPage from "./Pages/ApplicationPage.tsx"
import ReportPage from './Pages/ReportPage';
import AuditPage from './Pages/AuditPage';
import DashboardPage from "./Pages/Dashboard.tsx"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(setToken(token));
    }
  }, [dispatch]);

  return (
    <>
      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/:applicationid" element={<ApplicationPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/audit" element={<AuditPage />} />
          </Route>
          <Route path="/auth/callback" element={<OAuthCallback />} />
        </Routes>
      </div>
      <ToastContainer />

    </>
  )
}

export default App;
