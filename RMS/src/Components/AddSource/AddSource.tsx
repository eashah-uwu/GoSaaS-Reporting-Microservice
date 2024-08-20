import React, { useEffect, useState } from "react";
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
  onEdit?: (updatedSource: any) => void;
  applicationId: string;
  sourceToEdit?: any; 
};

const AddSource: FC<AddSourceProps> = ({
  open,
  onClose,
  onAdd,
  onEdit,
  applicationId,
  sourceToEdit,
}) => {
  const [formData, setFormData] = useState({
    username:  "",
    password: "",
    database:  "",
    type:  "",
    host:  "",
    port:  "",
    alias:  "",
  });

  

  const [saveDisabled, setSaveDisabled] = useState(true);

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
      if (sourceToEdit) {
        console.log(sourceToEdit.connectionid)
        console.log({ ...formData, applicationId, userId })
        const response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/connections/${sourceToEdit.connectionid}`,
          { ...formData, applicationId, userId }
        );
        if (response.status === StatusCodes.OK) {
          toast.success("Connection updated successfully!");
          onEdit && onEdit(response.data.connection);
        } else {
          toast.error("Failed to update connection: " + response.data.message);
        }
      } else {
        // Add mode
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/connections`,
          { ...formData, applicationId, userId }
        );
        if (response.status === StatusCodes.CREATED) {
          toast.success("Connection added successfully!");
          onAdd(response.data.connection);
        } else {
          toast.error("Failed to add connection: " + response.data.message);
        }
      }

      setSaveDisabled(true);
      handleClose();
    } catch (error: any) {
      toast.error("Failed to save connection: " + error.message);
    }
  };

  const handleConnect = async () => {
    try {
      console.log(sourceToEdit)
      console.log(formData)
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
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{sourceToEdit ? "Edit Source" : "Add Source"}</DialogTitle>
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
          <DialogActions>
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
              {sourceToEdit ? "Update" : "Save"}
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSource;