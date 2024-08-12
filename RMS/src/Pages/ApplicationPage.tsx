import React, { useEffect, useState } from "react";
import { useParams, redirect } from "react-router-dom";
import axios from "axios";
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
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/applications/${id}`
        );
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
      <main className={classes.main_content}>
        <Typography
          variant="h4"
          sx={{
            paddingLeft: "12rem",
            paddingRight: "12rem",
            marginTop: "3rem",
            textAlign: "left",
          }}
        >
          {applicationData && (
            <div className={classes.appName}>{applicationData.name}</div>
          )}
          {applicationData && (
            <div className={classes.appDes}>{applicationData.description}</div>
          )}
        </Typography>
        {applicationData && (
          <div className={classes.buttonDiv}>
            <Button
              size="small"
              onClick={() => handleButtonClick("source")}
              sx={{
                color: activeButton !== "source" ? "#7d0e0e" : "white",
                backgroundColor:
                  activeButton !== "source" ? "white" : "#7d0e0e",
                border: "1px solid #7d0e0e",
                ":hover": {
                  backgroundColor:
                    activeButton !== "source" ? "white" : "#7d0e0e",
                  color: activeButton !== "source" ? "#7d0e0e" : "white",
                },
              }}
            >
              Source
            </Button>
            <Button
              size="small"
              onClick={() => handleButtonClick("destination")}
              sx={{
                color: activeButton !== "destination" ? "#7d0e0e" : "white",
                backgroundColor:
                  activeButton !== "destination" ? "white" : "#7d0e0e",
                border: "1px solid #7d0e0e",
                marginLeft: "0.3rem",
                ":hover": {
                  backgroundColor:
                    activeButton !== "destination" ? "white" : "#7d0e0e",
                  color: activeButton !== "destination" ? "#7d0e0e" : "white",
                },
              }}
            >
              Destination
            </Button>
            <Button
              size="small"
              onClick={() => handleButtonClick("reports")}
              sx={{
                color: activeButton !== "reports" ? "#7d0e0e" : "white",
                backgroundColor:
                  activeButton !== "reports" ? "white" : "#7d0e0e",
                marginLeft: "0.3rem",
                border: "1px solid #7d0e0e",
                ":hover": {
                  backgroundColor:
                    activeButton !== "reports" ? "white" : "#7d0e0e",
                  color: activeButton !== "reports" ? "#7d0e0e" : "white",
                },
              }}
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
