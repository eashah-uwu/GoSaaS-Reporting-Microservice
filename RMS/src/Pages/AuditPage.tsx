import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar/Navbar";
import { Box, Typography, Select, MenuItem, TextField } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../State/store";
import Audit from "../Components/Audit/Audit";
import Filter from "../Components/Filter/Filter";


const AuditPage = () => {
  const token = useSelector((state: RootState) => state.auth.token);
  
  const [filters, setFilters] = useState<any>({
    user: "",
    module: "",
    event: "",
    dateFrom: "",
    dateTo: "",
    sortField: "",
    sortOrder: "",
    status: ""
  });

  
  

  return (
    <>
      <Navbar />
      <Typography variant="h4" sx={{ marginTop: "2rem", marginLeft: "10%" }}>
        Audit Overview
      </Typography>

      
      
      <Audit  />
    </>
  );
};

export default AuditPage;
