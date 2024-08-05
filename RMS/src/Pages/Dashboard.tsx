import React from "react";
import Navbar from "../Components/Navbar";
import Table from "../Components/Table/Table";
import Dashboard from "../Components/Dashboard/Dashboard";
import WidgetWrapper from "../Components/WidgetWrapper";
import { Box, Typography } from "@mui/material";

function DashboardPage(){

  const handleAdd = () => {

  }
  return (
    <>
      <Navbar />
      <Typography variant="h4" sx={{  marginTop: "2rem", marginLeft:"10%" }}>
        Dashboard
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          padding: "1rem",
          marginTop: "2rem",
          marginBottom: "2rem",
        }}
      >
        <WidgetWrapper customColor="#8B0000" sx={{ marginLeft: "14%", marginRight:"2rem" }}>
          <Typography variant="body1" sx={{ color: "white" }}>Total Reports: </Typography>
        </WidgetWrapper>
        <WidgetWrapper customColor="#8B0000" sx={{  marginRight:"2rem" }}>
          <Typography variant="body1" sx={{ color: "white" }}>Processing: </Typography>
        </WidgetWrapper>
        <WidgetWrapper customColor="#8B0000" sx={{  marginRight:"2rem" }}>
          <Typography variant="body1" sx={{ color: "white" }}>Queued: </Typography>
        </WidgetWrapper>
        <WidgetWrapper customColor="#8B0000" >
          <Typography variant="body1" sx={{ color: "white" }}>Failed: </Typography>
        </WidgetWrapper>
      </Box>
    
      <Dashboard />
     
     
      
    </>
  );
}

export default DashboardPage;
