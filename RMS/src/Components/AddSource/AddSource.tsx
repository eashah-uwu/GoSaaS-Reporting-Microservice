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
import { FC } from "react";

interface AddSourceProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newApplication: any) => void;
}

const AddSource: FC<AddSourceProps> = ({ open, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    database: "",
    type: "",
    host: "",
    port: "",
    alias: "",
  });
  const [valid, setValid] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const data = { ...formData };
    console.log(data);
    if (!valid) {
      alert("Please test the connection before saving!");
      return;
    }
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/connections`,
        data
      );
      console.log(response.data);
      if (response.data.success) {
        alert("Connection added successfully!");
        onAdd(response.data.data);
        onClose();
      } else {
        alert("Failed to add connection: " + response.data.message);
      }
    } catch (error: any) {
      console.error("Error adding connection:", error);
      alert("Failed to add connection: " + error.message);
    }
  };

  const onTest = async () => {
    console.log("Testing connection...");
    console.log("formDATA", formData);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/connections/test-connection`,
        formData
      );
      if (response.data.success) {
        alert("Connection successful!");
        setValid(true);
      } else {
        alert("Connection failed: " + response.data.message);
      }
    } catch (error: any) {
      console.error("Error testing connection:", error);
      alert("Connection failed: " + error.message);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
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
            <DialogActions>
              <Button onClick={onTest} color="primary">
                Test
              </Button>
              <Button type="submit" color="primary">
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
