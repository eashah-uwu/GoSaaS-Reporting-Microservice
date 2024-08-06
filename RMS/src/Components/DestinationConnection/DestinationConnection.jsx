import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import PropTypes from "prop-types";
import styles from "./DestinationConnection.module.css";

const DestinationConnection = ({ isOpen, closeForm }) => {
  const [formData, setFormData] = useState({
    alias: '',
    destination: '',
    url: '',
    apiKey: '' // Added apiKey field
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Destination form submitted");
  };

  return (
    <Dialog open={isOpen} onClose={closeForm}>
      <DialogTitle>Destination Connection</DialogTitle>
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
                label="API Key" // New field
                type="text"
                fullWidth
                value={formData.apiKey}
                onChange={handleChange}
              />
            </div>
          </div>
          <DialogActions className={styles.formActions}>
            <Button type="submit" color="primary" className={styles.connectButton}>
              Connect Destination
            </Button>
            <Button onClick={closeForm} className={styles.closeButton}>
              Close
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

DestinationConnection.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeForm: PropTypes.func.isRequired,
};

export default DestinationConnection;
