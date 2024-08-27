import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar/Navbar";

import { Box, Typography, Select, MenuItem, TextField } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../State/store";
import Audit from "../Components/Audit/Audit";
import Filter from "../Components/Filter/Filter";
import WidgetWrapper from "../Components/WidgetWrapper";
import Breadcrumbs from "../Components/BreadCrumbs/BreadCrumbs";


const AuditPage = () => {

  
 


  return (
    <>
      <Navbar />
      <Breadcrumbs/>
      <Typography variant="h4" sx={{ marginTop: "2rem", marginLeft: "10%" }}>
        Audit Overview
      </Typography>

      
      
      <Audit  />
    </>
  );
};

export default AuditPage;
