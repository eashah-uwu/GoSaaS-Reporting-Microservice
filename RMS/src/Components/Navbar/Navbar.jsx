import React, { useState } from 'react';
import styles from './Navbar.module.css';
import logo from "../../Assets/logo.png";
import { Link, useNavigate} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearToken } from '../../State/authSlice';
import { LogoutOutlined } from '@mui/icons-material';
import { persistor } from '../../State/store';
import Sidebar from '../Sidebar/Sidebar';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for toggling sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar state
  };
  const token = useSelector((state) => state.auth.token);
   
  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearToken());
    persistor.purge(); 
    navigate('/login'); 
  };

    return (
      <>
        <div className="nav">
            <nav className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <button className={styles.menuButton} onClick={toggleSidebar}>&#9776;</button> {/* Menu button to toggle sidebar */}
          <button className={styles.logoButton}>
            <img src={logo} alt="GoSaaS Logo" className={styles.logo} />
          </button>
        </div>
        <div className={styles.navbarRight}>
          {/* <button className={styles.iconButton}>&#128276;</button> {/* Bell icon */}
          {/* <button className={styles.iconButton}>&#128100;</button> User icon
          <button className={styles.dropdownButton}>&#9660; */} 
         
            {/* </button> Down arrow */}
            {token &&
          <LogoutOutlined
          onClick={handleLogout}
          sx={{
            "&:hover": {
              cursor: "pointer",
            }
          }}
        />
}
        
        </div>
      </nav>
      <Sidebar isOpen={isSidebarOpen} /> {/* Sidebar component */}
            <ul >
               
            
           
                
            </ul>
            </div>
            </>
  );
};

export default Navbar;
