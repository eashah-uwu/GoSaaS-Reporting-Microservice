import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Typography } from "@mui/material";
import PropTypes from "prop-types";
import styles from "./ConfigureReport.module.css";
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Ensure this package is installed

const ConfigureReport = ({ isOpen, closeForm }) => {
  const [formData, setFormData] = useState({
    alias: '',
    description: '',
    source: '',
    destination: '',
    storedProcedure: '',
    parameter: ''
  });

  const [isSuccess, setIsSuccess] = useState(false); // State for success message

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate successful form submission
    setIsSuccess(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccess(false);
    closeForm(); // Close the dialog
  };

  return (
    <Dialog open={isOpen} onClose={closeForm} maxWidth="sm" fullWidth>
      {isSuccess ? (
        <DialogContent className={styles.successContent}>
          <CheckCircleIcon className={styles.successIcon} />
          <Typography variant="h6">Configuration Successful</Typography>
          <Button onClick={handleCloseSuccess} variant="contained" color="primary">Close</Button>
        </DialogContent>
      ) : (
        <>
          <DialogTitle>Configure Report</DialogTitle>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <div className={styles.formContainer}>
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
                <TextField
                  margin="dense"
                  id="description"
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formItem}>
                  <TextField
                    margin="dense"
                    id="source"
                    name="source"
                    label="Source"
                    select
                    fullWidth
                    value={formData.source}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select Source</MenuItem>
                    <MenuItem value="source1">Source 1</MenuItem>
                    <MenuItem value="source2">Source 2</MenuItem>
                  </TextField>
                </div>
                <div className={styles.formItem}>
                  <TextField
                    margin="dense"
                    id="destination"
                    name="destination"
                    label="Destination"
                    select
                    fullWidth
                    value={formData.destination}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select Destination</MenuItem>
                    <MenuItem value="dest1">Destination 1</MenuItem>
                    <MenuItem value="dest2">Destination 2</MenuItem>
                  </TextField>
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formItem}>
                  <TextField
                    margin="dense"
                    id="storedProcedure"
                    name="storedProcedure"
                    label="Stored Procedure"
                    select
                    fullWidth
                    value={formData.storedProcedure}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Select Stored Procedure</MenuItem>
                    <MenuItem value="proc1">Procedure 1</MenuItem>
                    <MenuItem value="proc2">Procedure 2</MenuItem>
                  </TextField>
                </div>
                <div className={styles.formItem}>
                  <TextField
                    margin="dense"
                    id="parameter"
                    name="parameter"
                    label="Parameter"
                    type="text"
                    fullWidth
                    value={formData.parameter}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <DialogActions className={styles.formActions}>
                <Button type="submit" color="primary">Add</Button>
              </DialogActions>
            </form>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

ConfigureReport.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeForm: PropTypes.func.isRequired,
};

export default ConfigureReport;
