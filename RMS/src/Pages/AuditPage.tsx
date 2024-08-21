import React from 'react';
import Navbar from "../Components/Navbar/Navbar";
import WidgetWrapper from "../Components/WidgetWrapper";
import { Box, Typography } from "@mui/material";

function AuditPage() {
  return (
    <>
      <Navbar />
      <Typography variant="h4" sx={{ marginTop: "2rem", marginLeft: "10%" }}>
        Audit Overview
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
            Total Audits Conducted:
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
            Audits in Progress:
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
            Successful Audits:
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
            Failed Audits:
          </Typography>
        </WidgetWrapper>
      </Box>
      <Box sx={{ marginTop: "2rem", textAlign: "center" }}>
        <Typography variant="body1">
          Detailed audit statistics will be available soon. Stay tuned!
        </Typography>
      </Box>
    </>
  );
}

export default AuditPage;
