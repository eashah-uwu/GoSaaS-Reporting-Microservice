import React from "react";
import TableConfig from '../Components/TableConfig/TableConfig';
import Navbar from "../Components/Navbar";
import classes from "./pages.module.css";
import { CssBaseline } from "@mui/material";

const ApplicationPage = () => {
 
  

  return (
    <>
    <CssBaseline />
      <Navbar />
      <TableConfig/>
    </>
  );

};

export default ApplicationPage;
