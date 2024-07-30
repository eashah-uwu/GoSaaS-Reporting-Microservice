import React, { useState } from 'react';
import styles from './Navbar.module.css';
import logo from '../Assets/logo.png';
import Sidebar from './Sidebar'; // Import Sidebar component
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for toggling sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar state
  };

    return (
        <div className="nav">
            <nav className={styles.navbar}>
        <div className={styles.navbarLeft}>
          <button className={styles.menuButton} onClick={toggleSidebar}>&#9776;</button> {/* Menu button to toggle sidebar */}
          <button className={styles.logoButton}>
            <img src={logo} alt="GoSaaS Logo" className={styles.logo} />
          </button>
        </div>
        <div className={styles.navbarRight}>
          <button className={styles.iconButton}>&#128276;</button> {/* Bell icon */}
          <button className={styles.iconButton}>&#128100;</button> {/* User icon */}
          <button className={styles.dropdownButton}>&#9660;</button> {/* Down arrow */}
        </div>
      </nav>
      <Sidebar isOpen={isSidebarOpen} /> {/* Sidebar component */}
            <ul >
                <li><Link className="li" to="/">Dashboard</Link></li>
                <li><Link className="li" to="/login">Login</Link> </li>
                <li><Link className="li" to="/application">Application</Link> </li>
            </ul>
            </div>

  );
};

export default Navbar;
