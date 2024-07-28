import { Route, Routes } from "react-router-dom"


import LoginPage from "./Pages/LoginPage.tsx"
import ApplicationPage from "./Pages/ApplicationPage.tsx"
import Dashboard from "./Pages/Dashboard.tsx"


function App() {
  return (
    
      <>
    
      <div className="container">
      
        <Routes>
          <Route path="/" element={<Dashboard/>}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/application" element={<ApplicationPage />}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App