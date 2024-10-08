import React, { useState, useEffect, useRef } from 'react';
import styles from './Sidebar.module.css';
import { Link,useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../State/store';
import { FC } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void; // Function to close the sidebar
}

const Sidebar: FC<SidebarProps> = ({ isOpen, onClose}) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(target) &&
        !(target.closest('.menuButton') || target.closest('.navbar'))
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div ref={sidebarRef} className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <ul className={styles.ul}>
        {token &&  location.pathname !== '/login' && <li className={styles.li}><Link to="/">Dashboard</Link></li>}
        {(!token || location.pathname === '/login') && <li className={styles.li}><Link to="/login">Login</Link></li> }
        {token && location.pathname !== '/login' && <li className={styles.li}><Link to="/audit">Audit Trails</Link></li>}
        {token && location.pathname !== '/login' && <li className={styles.li}><Link to="/report">Reports</Link></li>}
      </ul>
    </div>
  );
};

export default Sidebar;
