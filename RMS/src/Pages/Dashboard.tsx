
import Navbar from "../Components/Navbar/Navbar";
import Table from "../Components/Table/Table";
import React, { useEffect, useState } from "react";
import Dashboard from "../Components/Dashboard/Dashboard";
import WidgetWrapper from "../Components/WidgetWrapper";
import { useSelector } from "react-redux";
import { RootState } from "../State/store";
import { Box, Typography } from "@mui/material";
import axios from "axios";

function DashboardPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportStats, setReportStats] = useState<any>({});
  const token = useSelector((state: RootState) => state.auth.token);

  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  useEffect(() => {
    const fetchReportStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL
          }/api/reports/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReportStats(response.data.data);
      } catch (error) {
        console.error("Failed to fetch application data", error);
      }
    };

    fetchReportStats();
  }, []); 
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
            Total Reports: {reportStats.totalReports?reportStats.totalReports:0}
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
            Processing:{reportStats.processing?reportStats.processing:0}
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
            Successful:{reportStats.successful?reportStats.successful:0}
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
            Failed:{reportStats.failed?reportStats.failed:0}
          </Typography>
        </WidgetWrapper>
      </Box>

      <Dashboard />
    </>
  );
}

export default DashboardPage;
