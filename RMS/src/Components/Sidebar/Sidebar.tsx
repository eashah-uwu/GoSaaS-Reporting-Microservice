import React from 'react';
import styles from './Sidebar.module.css';
import { Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { FC } from "react";
interface SidebarProps {
  isOpen: boolean;
}
const Sidebar : FC<SidebarProps>= ({ isOpen }) => {
  const token = useSelector((state: RootState) => state.auth.token);
  
  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <ul className={styles.ul}>
        <li className={styles.li}><Link to="/">Dashboard</Link></li>
        {!token && <li className={styles.li}><Link to="/login">Login</Link></li> }
        <li className={styles.li}><Link to="/audit">Audit Trails</Link></li>
        <li className={styles.li}><Link to="/report">Reports</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
