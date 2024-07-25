import { Route, Routes } from "react-router-dom"

import Dashboard from "./Pages/Dasboard.jsx" 
import LoginPage from "./Pages/LoginPage.jsx"



function App() {
  return (
    
      <>
    
      <div className="container">
      
        <Routes>
          <Route path="/" element={<Dashboard/>}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App