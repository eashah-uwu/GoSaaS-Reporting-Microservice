import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs as MuiBreadcrumbs, Typography } from '@mui/material';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <MuiBreadcrumbs aria-label="breadcrumb" sx={{
      margin: '1rem',
      color: "#bc1a1a",
    }}>
      <Link to="/" style={{color:"#bc1a1a",textDecoration:"none"}}>{`> Dashboard`}</Link>
      {pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;

        return last ? (
          <Typography key={to} sx={{color: "#bc1a1a"}}>
            {value}
          </Typography>
        ) : (
          <Link key={to} to={to} style={{color:"#bc1a1a"}}>
            {value}
          </Link>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
