import React, { useEffect, useState } from "react";
import { useParams, redirect } from "react-router-dom";
import axios from 'axios';
import Navbar from "../Components/Navbar/Navbar";
import { Typography, Button } from "@mui/material";
import classes from "./ApplicationPage.module.css";
import Source from "../Components/Source/Source";
import Destination from "../Components/Destination/Destination";
import Report from "../Components/Report/Report";


const ApplicationPage = () => {
  const { id } = useParams();
  const [applicationData, setApplicationData] = useState<any>(null);
  const [activeButton, setActiveButton] = useState<string>("source");

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/applications/${id}`);
        setApplicationData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Failed to fetch application data", error);
      }
    };

    fetchApplicationData();
  }, [id]);

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  if (!id) {
    return redirect("/");
  }

  return (
    <>
      <Navbar />
      <Typography variant="h4" sx={{ marginTop: "2rem", marginLeft: "10%" }}>
        {applicationData && applicationData.name}
      </Typography>
      <main className={classes.main_content}>
        <div>{applicationData && applicationData.description}</div>
        {applicationData && (
          <div>
            <Button
              variant={activeButton !== "source"?"outlined":"contained"}
              color="primary"
              size="small"
              onClick={() => handleButtonClick("source")}
            >
              Source 
            </Button>
            <Button
              variant={activeButton !== "destination"?"outlined":"contained"}
              color="primary"
              size="small"
              onClick={() => handleButtonClick("destination")}
            >
              Destination
            </Button>
            <Button
              variant={activeButton !== "reports"?"outlined":"contained"}
              color="primary"
              size="small"
              onClick={() => handleButtonClick("reports")}
            >
              Reports
            </Button>
          </div>
        )}

        <div className={classes.component_content}>
          {activeButton === "source" && <Source applicationId={id} />}
          {activeButton === "destination" && <Destination applicationId={id} />}
          {activeButton === "reports" && <Report applicationId={id} />}
        </div>
      </main>
    </>
  );
};

export default ApplicationPage;