import React from "react";
import TableConfig from "../Components/TableConfig/TableConfig";
import Navbar from "../Components/Navbar/Navbar";
import classes from "./pages.module.css";
import { CssBaseline } from "@mui/material";

const ApplicationPage = () => {
  return (
    <>
      <CssBaseline />
      <Navbar />   
    </>
  );
};

export default ApplicationPage;
