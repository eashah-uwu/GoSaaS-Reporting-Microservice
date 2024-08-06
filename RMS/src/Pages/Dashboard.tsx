import React, { useState } from "react";
import Navbar from "../Components/Navbar/Navbar";
import SourceConnection from "../Components/SourceConnection/SourceConnection.jsx"; // Ensure correct import path
import DestinationConnection from "../Components/DestinationConnection/DestinationConnection.jsx"; // Ensure correct import path
import ConfigureReport from "../Components/ConfigureReport/ConfigureReport.jsx"; // Ensure correct import path

function Dashboard() {
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isDestinationModalOpen, setIsDestinationModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const openSourceModal = () => setIsSourceModalOpen(true);
  const closeSourceModal = () => setIsSourceModalOpen(false);

  const openDestinationModal = () => setIsDestinationModalOpen(true);
  const closeDestinationModal = () => setIsDestinationModalOpen(false);

  const openReportModal = () => setIsReportModalOpen(true);
  const closeReportModal = () => setIsReportModalOpen(false);

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
    </>
  );
}

export default Dashboard;
