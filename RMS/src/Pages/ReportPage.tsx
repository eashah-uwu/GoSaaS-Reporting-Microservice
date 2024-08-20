import Navbar from "../Components/Navbar/Navbar";
import Table from "../Components/Table/Table";
import Dashboard from "../Components/Dashboard/Dashboard";
import WidgetWrapper from "../Components/WidgetWrapper";
import { useState } from "react";
import { Box, Typography } from "@mui/material";
import ReportHistory from "../Components/ReportHistory/ReportHistory";

function ReportPage() {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

  const handleAdd = () => {};
  return (
    <>
      <Navbar />
      <Typography
        variant="h4"
        sx={{ marginTop: "2rem", marginLeft: "10%", marginBottom: "3rem" }}
      >
        Report History
      </Typography>
      <ReportHistory />
    </>
  );
}

export default ReportPage;
