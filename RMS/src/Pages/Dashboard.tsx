import React from "react";
import Navbar from "../Components/Navbar/Navbar";
import Table from "../Components/Table/Table";
import Dashboard from "../Components/Dashboard/Dashboard";
import WidgetWrapper from "../Components/WidgetWrapper";
import { useState } from "react";
import { Box, Typography } from "@mui/material";

function DashboardPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  const handleAdd = () => {};
  return (
    <>
      <Navbar />
     



      <Typography variant="h4" sx={{ marginTop: "2rem", marginLeft: "10%" }}>
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
          justifyContent: "center",
          gap: "0.6rem", // Reduced gap to make the boxes closer to each other
        }}
      >
        <WidgetWrapper customColor="#8B0000">
          <Typography
            variant="overline" // Changed to a smaller variant
            sx={{
              color: "white",
              textAlign: "center",
              padding: "0.1rem 0.1rem", // Reduced padding to make the boxes smaller
              borderRadius: "0.35rm",
            }}
          >
            Total Reports:
          </Typography>
        </WidgetWrapper>
        <WidgetWrapper customColor="#8B0000">
          <Typography
            variant="overline"
            sx={{
              color: "white",
              textAlign: "center",
              padding: "0.1rem 0.1rem",
            }}
          >
            Processing:
          </Typography>
        </WidgetWrapper>
        <WidgetWrapper customColor="#8B0000">
          <Typography
            variant="overline"
            sx={{
              color: "white",
              textAlign: "center",
              padding: "0.1rem 0.1rem",
            }}
          >
            Queued:
          </Typography>
        </WidgetWrapper>
        <WidgetWrapper customColor="#8B0000">
          <Typography
            variant="overline"
            sx={{
              color: "white",
              textAlign: "center",
              padding: "0.1rem 0.1rem",
            }}
          >
            Failed:
          </Typography>
        </WidgetWrapper>
      </Box>

      <Dashboard />
    </>
  );
}

export default DashboardPage;
