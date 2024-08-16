import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import styles from "./AddSource.module.css";
import { toast } from "react-toastify";
import { FC } from "react";
import { StatusCodes } from "http-status-codes";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
interface AddSourceProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newSource: any) => void;
  applicationId: string;
}

const AddSource: FC<AddSourceProps> = ({
  open,
  onClose,
  onAdd,
  applicationId,
}) => {
  const [formData, setFormData] = useState({
    username: "root",
    password: "12345678",
    database: "rms_db",
    type: "PostgreSQL",
    host: "localhost",
    port: "5432",
    alias: "",
  });
  const [saveDisabled, setSaveDisabled] = useState(true);
  // Retrieve userId from Redux state
  const userId = useSelector((state: RootState) => state.auth.userId);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saveDisabled) {
      toast.error("Please test the connection before saving!");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/connections`,
        { ...formData, applicationId, userId }
      );
      if (response.status === StatusCodes.CREATED) {
        toast.success("Connection added successfully!");
        onAdd(response.data.connection);
        setSaveDisabled(true);
        handleClose(); // Ensure form data is cleared
      } else {
        toast.error("Failed to add connection: " + response.data.message);
      }
    } catch (error: any) {
      toast.error("Failed to add connection: " + error.message);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/connections/test-connection`,
        formData
      );
      if (response.data.success) {
        toast.success("Connection successful!");
        setSaveDisabled(false);
      } else {
        toast.error("Connection failed: " + response.data.message);
        setSaveDisabled(true);
      }
    } catch (error: any) {
      toast.error("Error connecting to source. Please try again.");
      setSaveDisabled(true);
    }
  };

  const handleClose = () => {
    setFormData({
      username: "",
      password: "",
      database: "",
      type: "",
      host: "",
      port: "",
      alias: "",
    });
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Source Connection</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <div className={styles.formContainer}>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="username"
                  name="username"
                  label="Username"
                  type="text"
                  fullWidth
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  fullWidth
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.formContainer}>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="database"
                  name="database"
                  label="Database"
                  type="text"
                  fullWidth
                  value={formData.database}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="type"
                  name="type"
                  label="Type"
                  select
                  fullWidth
                  value={formData.type}
                  onChange={handleChange}
                >
                  <MenuItem value="">Select Type</MenuItem>
                  <MenuItem value="Oracle">Oracle</MenuItem>
                  <MenuItem value="PostgreSQL">PostgreSQL</MenuItem>
                </TextField>
              </div>
            </div>
            <div className={styles.formContainer}>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="host"
                  name="host"
                  label="Host"
                  type="text"
                  fullWidth
                  value={formData.host}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="port"
                  name="port"
                  label="Port"
                  type="text"
                  fullWidth
                  value={formData.port}
                  onChange={handleChange}
                />
              </div>
            </div>
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
                Test Connection
              </Button>
              <Button
                size="small"
                onClick={handleClose}
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

export default AddSource;
