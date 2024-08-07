import { Route, Routes } from "react-router-dom"
import ProtectedRoute from './Components/ProtectedRoute';
import OAuthCallback from './Components/OAuthCallback';
import LoginPage from "./Pages/LoginPage.tsx"
import ApplicationPage from "./Pages/ApplicationPage.tsx"
import DashboardPage from "./Pages/Dashboard.tsx"


function App() {
  return (

    <>
      <div className="container">
        <Routes>

          <Route path="/application/:id" element={<ApplicationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route element={<ProtectedRoute />}>
          </Route>
        </Routes>
      </div>
    </>
  )
}

export default App   