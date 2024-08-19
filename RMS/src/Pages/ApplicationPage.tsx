import React, { useEffect, useState } from "react";
import { useParams, redirect } from "react-router-dom";
import axios from "axios";
import Navbar from "../Components/Navbar/Navbar";
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useMediaQuery, useTheme } from "@mui/material";

import classes from "./ApplicationPage.module.css";
import Source from "../Components/Source/Source";
import Destination from "../Components/Destination/Destination";
import Report from "../Components/Report/Report";
import EditIcon from "@mui/icons-material/Edit";

const ApplicationPage = () => {
  const { id } = useParams();
  const [applicationData, setApplicationData] = useState<any>(null);
  const [activeButton, setActiveButton] = useState<string>("source");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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

  if (!applicationData) return <div>Loading...</div>;

  const handleButtonClick = (buttonName: string) => {
    setActiveButton(buttonName);
  };

  if (!id) {
    return redirect("/");
  }

  const handleAdd = () => {
    if (applicationData) {
      setName(applicationData.name || "");
      setDescription(applicationData.description || "");
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleEdit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const updatedData = {
      ...applicationData,
      name: name,
      description: description,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/applications/${id}`,
        updatedData
      );
      if (response.status === 200) {
        console.log("Application data updated successfully");

        setApplicationData(response.data);
        setOpen(false);
      } else {
        console.log("Failed to update application data");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.status === 409) {
          alert("Application name already exists. Please choose another name.");
        } else {
          console.error("Failed to create application:", error);
          alert("An error occurred. Please try again later.");
        }
      } else {
        console.error("An unexpected error occurred:", error);
        alert("An unexpected error occurred. Please try again later.");
      }
    }
  };

  return (
    <>
      <Navbar />
      <main className={classes.main_content}>
        <Box
          sx={{
            background: "rgb(255, 255, 255)",
            padding: "1.3rem",
            boxShadow: isSmallScreen
              ? "rgba(0, 0, 0, 0.2) 0px 2px 4px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px"
              : "rgba(0, 0, 0, 0.2) 0px 4px 8px -1px, rgba(0, 0, 0, 0.14) 0px 2px 4px 0px",
            borderRadius: "4px",
            marginTop: isSmallScreen ? "1rem" : "2rem",
            marginLeft: isSmallScreen ? "1rem" : "9.5rem",
            marginRight: isSmallScreen ? "1rem" : "9.5rem",
            position: "relative",
            width: isSmallScreen ? "auto" : "auto",
          }}
        >
          <Button
            type="submit"
            onClick={handleAdd}
            sx={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              width: "auto",
              height: "40px",
              backgroundColor: "#8B0000",
              color: "#FFFFFF",
              borderRadius: "0.35rem",
              "&:hover": {
                backgroundColor: "#C70039",
              },
            }}
          >
            <EditIcon />
            Edit Application
          </Button>
          <Typography variant="h4" sx={{ textAlign: "left" }}>
            {applicationData && (
              <div>
                <div className={classes.appName}>
                  {name || applicationData.name}
                </div>
                <div className={classes.appDes}>
                  {description || applicationData.description}
                </div>
              </div>
            )}
          </Typography>
        </Box>

        {/* Rest of your code remains the same */}
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
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Application</DialogTitle>
        <form onSubmit={handleEdit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              variant="standard"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default ApplicationPage;
