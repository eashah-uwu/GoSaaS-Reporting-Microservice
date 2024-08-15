import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import styles from "./AddDestination.module.css";
import { toast } from "react-toastify";
import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { StatusCodes } from "http-status-codes";

interface AddDestinationProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newDestination: any) => void;
  applicationId: string;
}

const AddDestination: FC<AddDestinationProps> = ({
  open,
  onClose,
  onAdd,
  applicationId,
}) => {
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [formData, setFormData] = useState({
    alias: "",
    destination: "aws",
    url: "AKIAVPEYV6R3PQKL5OAV",
    apiKey: "MmCHyXR+AVUmuxywRqHrLQx318htFQT19Hs1gCUe",
  });

  // Retrieve userId from Redux state
  const userId = useSelector((state: RootState) => state.auth.userId);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    try {
      const saveResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/destinations`,
        { ...formData, applicationId, userId }
      );

      if (saveResponse.status === StatusCodes.OK) {
        toast.success("Destination saved successfully!");
        onAdd(saveResponse.data.destination);
        setSaveDisabled(true);
        onClose();
      } else {
        toast.error("Failed to save destination.");
      }
    } catch (error) {
      toast.error("Error saving destination. Please try again.");
    }
    setSaveDisabled(!saveDisabled);
  };

  const handleConnect = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/destinations/connect`,
        formData
      );
      if (response.status === StatusCodes.OK) {
        toast.success("Connection successful!");
        setSaveDisabled(false);
      } else {
        toast.error("Connection failed. Please check the details.");
        setSaveDisabled(true);
      }
    } catch (error) {
      toast.error("Error connecting to destination. Please try again.");
      setSaveDisabled(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Destination</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <div className={styles.formContainer}>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="alias"
                  name="alias"
                  label="Alias"
                  type="text"
                  fullWidth
                  value={formData.alias}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="destination"
                  name="destination"
                  label="Destination"
                  type="text"
                  fullWidth
                  value={formData.destination}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.formContainer}>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="url"
                  name="url"
                  label="URL"
                  type="text"
                  fullWidth
                  value={formData.url}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="apiKey"
                  name="apiKey"
                  label="API Key"
                  type="text"
                  fullWidth
                  value={formData.apiKey}
                  onChange={handleChange}
                />
              </div>
            </div>
            <DialogActions className={styles.formActions}>
              <Button
                size="small"
                onClick={handleConnect}
                sx={{
                  backgroundColor: "#7d0e0e",
                  color: "white",
                  ":hover": {
                    backgroundColor: "#7d0e0e",
                    color: "white",
                  },
                  marginRight: "auto",
                }}
              >
                Connect Destination
              </Button>
              <Button
                size="small"
                onClick={onClose}
                sx={{
                  backgroundColor: "#7d0e0e",
                  color: "white",
                  ":hover": {
                    backgroundColor: "#7d0e0e",
                    color: "white",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="small"
                disabled={saveDisabled}
                sx={{
                  backgroundColor: saveDisabled ? "white" : "#7d0e0e",
                  color: "white",
                  ":hover": {
                    backgroundColor: "#7d0e0e",
                    color: "white",
                  },
                }}
              >
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddDestination;
