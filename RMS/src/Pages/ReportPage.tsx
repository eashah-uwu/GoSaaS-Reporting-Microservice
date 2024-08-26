import React from 'react';
import Navbar from "../Components/Navbar/Navbar";
import WidgetWrapper from "../Components/WidgetWrapper";
import { Box, Typography } from "@mui/material";
import ReportHistory from '../Components/ReportsHistory/ReportsHistory';
import Breadcrumbs from "../Components/BreadCrumbs/BreadCrumbs";
function ReportPage() {
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
            Total Reports Generated:
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
            Reports in Review:
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
            Approved Reports:
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
            Rejected Reports:
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
