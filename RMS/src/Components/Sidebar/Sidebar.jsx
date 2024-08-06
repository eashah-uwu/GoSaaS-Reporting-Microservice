import React from 'react';
import styles from './Sidebar.module.css';
import { Link } from 'react-router-dom';

const Sidebar = ({ isOpen }) => {
  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <ul className={styles.ul}>
        <li className={styles.li}><Link to="/application">Application</Link></li>
        <li className={styles.li}><Link to="/">Dashboard</Link></li>
        <li className={styles.li}><Link to="/audittrails">Audit Trails</Link></li>
        <li className={styles.li}><Link to="/reports">Reports</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;