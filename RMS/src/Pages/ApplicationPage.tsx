import React from 'react';
import Navbar from '../Components/Navbar';
import classes from "./pages.module.css"
import TableConfig from '../Components/TableConfig/TableConfig';
const ApplicationPage = () => {
    
    return (
        <>
            <Navbar />
           <TableConfig/>
        </>
    );
};

export default ApplicationPage;
