import React from "react";
import Navbar from "../Components/Navbar/Navbar";
import Table from "../Components/Table/Table";
import Dashboard from "../Components/Dashboard/Dashboard";
import WidgetWrapper from "../Components/WidgetWrapper";
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import SourceConnection from "../Components/SourceConnection/SourceConnection.jsx"; // Ensure correct import path
import DestinationConnection from "../Components/DestinationConnection/DestinationConnection.jsx"; // Ensure correct import path
import ConfigureReport from "../Components/ConfigureReport/ConfigureReport.jsx"; // Ensure correct import path

function DashboardPage(){

  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const openSourceModal = () => setIsSourceModalOpen(true);
  const closeSourceModal = () => setIsSourceModalOpen(false);

  const openDestinationModal = () => setIsDestinationModalOpen(true);
  const closeDestinationModal = () => setIsDestinationModalOpen(false);

  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  const handleAdd = () => {

  }
  return (
    <>
      <Navbar />
      <div>
        <button onClick={openSourceModal}>Source</button>
        <button onClick={openDestinationModal}>Destination</button>
        <button onClick={openReportModal}>Report</button>
      </div>

      <SourceConnection
        isOpen={isSourceModalOpen}
        closeForm={closeSourceModal}
      />
      <DestinationConnection
        isOpen={isDestinationModalOpen}
        closeForm={closeDestinationModal}
      />
      <ConfigureReport
        isOpen={isReportModalOpen}
        closeForm={closeReportModal}
      />

      
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
          justifyContent:"center",
          gap:"2rem"
        }}
      >
        <WidgetWrapper customColor="#8B0000" >
          <Typography variant="body1" sx={{ color: "white" }}>Total Reports: </Typography>
        </WidgetWrapper>
        <WidgetWrapper customColor="#8B0000">
          <Typography variant="body1" sx={{ color: "white" }}>Processing: </Typography>
        </WidgetWrapper>
        <WidgetWrapper customColor="#8B0000">
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
