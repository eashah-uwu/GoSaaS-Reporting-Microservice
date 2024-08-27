import Navbar from "../Components/Navbar/Navbar";
import WidgetWrapper from "../Components/WidgetWrapper";
import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../State/store";
import React, { useEffect, useState } from "react";
import ReportHistory from '../Components/ReportsHistory/ReportsHistory';
import Breadcrumbs from "../Components/BreadCrumbs/BreadCrumbs";
import axios from "axios";
function ReportPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportStats, setReportStats] = useState<any>({});
  const token = useSelector((state: RootState) => state.auth.token);

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
      <Breadcrumbs/>
      <Typography variant="h4" sx={{ marginTop: "2rem", marginLeft: "10%" }}>
        Reports Overview
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
          gap: "0.6rem",
        }}
      >
        <WidgetWrapper customColor="#8B0000">
          <Typography
            variant="overline"
            sx={{
              color: "white",
              textAlign: "center",
              padding: "0.1rem 0.1rem",
              borderRadius: "0.35rem",
            }}
          >
            Total Reports Generated: {reportStats.totalReports?reportStats.totalReports:0}
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
            Reports in Review:{reportStats.processing?reportStats.processing:0}
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
            Approved Reports:{reportStats.successful?reportStats.successful:0}
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
            Rejected Reports:{reportStats.failed?reportStats.failed:0}
          </Typography>
        </WidgetWrapper>
      </Box>
      <Box sx={{ marginTop: "2rem", textAlign: "center" }}>
        <ReportHistory/>
      </Box>
    </>
  );
}

export default ReportPage;
