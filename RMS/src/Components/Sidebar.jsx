// src/components/Sidebar.jsx
import React from 'react';
import styles from './Sidebar.module.css';

const Sidebar = ({ isOpen }) => {
  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <ul className={styles.ul}>
        <li className={styles.li}><a className={styles.a} href="#">Home</a></li>
        <li className={styles.li}>
          <a className={styles.a} href="#">Audit Trails</a>
        </li>
        <li className={styles.li}><a className={styles.a} href="#">Reports</a></li>
      </ul>
    </div>
  );
};

export default Sidebar;
