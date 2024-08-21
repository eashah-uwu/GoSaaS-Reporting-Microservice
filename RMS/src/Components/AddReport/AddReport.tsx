import React, { useState, useEffect, ChangeEvent } from "react";
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
import styles from "./AddReport.module.css";
import { toast } from "react-toastify";
import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";

interface AddReportProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newReport: any) => void;
  applicationId: string;
}

const AddReport: FC<AddReportProps> = ({ open, onClose, onAdd, applicationId }) => {
  const [sources, setSources] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [storedProcedures, setStoredProcedures] = useState<any[]>([]);
  const [parameters, setParameters] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const userid = useSelector((state: RootState) => state.auth.userId||"");
  const token = useSelector((state: RootState) => state.auth.token);
  // const [saveDisabled, setSaveDisabled] = useState(true)
  const [formData, setFormData] = useState({
    alias: '',
    description: '',
    source: '',
    destination: '',
    storedProcedure: '',
    parameter: ''
  });

  useEffect(() => {
    // Fetch sources and destinations based on applicationId
    const fetchDropdownData = async () => {
      try {
        const [sourcesResponse, destinationsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/connections/${applicationId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`, 
              },
            }
          ),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/destinations/${applicationId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`, 
              },
            }
          )
        ]);

        setSources(sourcesResponse.data.data);
        setDestinations(destinationsResponse.data.data);
     
      } catch (error) {
        toast.error("Failed to load dropdown data");
      }
    };

    fetchDropdownData();
  }, [applicationId]);


  const handleChange = async (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'source') {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/connections/get-stored-procedures`,
          { id: value },
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );

        if (response.data.success) {
          setStoredProcedures(response.data.data);
          toast.success("Connection successful, stored procedures loaded!");
        } else {
          toast.error("Failed to load stored procedures: " + response.data.message);
        }
      } catch (error: any) {
        toast.error("Error testing connection. Please try again.");
      }
    }
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  const handleProcedureSelect = (e: any) => {
    const selectedProc = storedProcedures.find(proc => proc.procedure_name === e.target.value);
    const { name, value } = e.target;
    setFormData({...formData,[name]: value,parameter:selectedProc.parameter_list})
    setParameters(selectedProc.parameter_list);
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please upload an .xls file.");
      return;
    }

    try {const formDataToSend = new FormData();
      formDataToSend.append("alias", formData.alias);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("source", formData.source);
      formDataToSend.append("destination", formData.destination);
      formDataToSend.append("storedProcedure", formData.storedProcedure);
      formDataToSend.append("parameter", formData.parameter);
      formDataToSend.append("userid", userid);
      formDataToSend.append("file", file);
      formDataToSend.append("applicationid", applicationId);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/reports`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        toast.success("Report created successfully!");
        onAdd(response.data.report);
        onClose();
      } else {
        toast.error("Failed to create report.");
      }
    } catch (error: any) {
      toast.error("Error creating report. Please try again.");
    }
  };


  return (
    <>
      <Dialog open={open} onClose={onClose} >
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
                  <MenuItem value="" hidden>Select Source</MenuItem>
                  {sources.map((source) => (
                    <MenuItem key={source.connectionid} value={source.connectionid}>
                      {source.alias}
                    </MenuItem>
                  ))}
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
                  <MenuItem value="" hidden>Select Destination</MenuItem>
                  {destinations.map((destination) => (
                    <MenuItem key={destination.destinationid} value={destination.destinationid}>
                      {destination.alias}
                    </MenuItem>
                  ))}
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
                  onChange={handleProcedureSelect}
                >
                  <MenuItem value="" hidden>Select Stored Procedure</MenuItem>
                  {storedProcedures.map((proc, index) => (
                    <MenuItem key={index} value={proc.procedure_name}>
                      {proc.procedure_name}
                    </MenuItem>
                  ))}
                </TextField>
              </div>
              <div className={styles.formItem}>
                <TextField
                  margin="dense"
                  id="parameter"
                  name="parameter"
                  label="Parameter"
                  type="text"
                  value={parameters}
                  InputProps={{
                    readOnly: true,
                  }}
                  fullWidth
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className={styles.formRow}>
              <input
                accept=".xsl"
                id="upload-file"
                type="file"
                onChange={handleFileChange}
              />
            </div>
            <DialogActions className={styles.formActions}>
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
                }}>
                Cancel
              </Button>
              <Button type="submit" size="small"
                sx={{
                  backgroundColor: "#7d0e0e",
                  color: "white",
                  ":hover": {
                    backgroundColor: "#7d0e0e",
                    color: "white",
                  },
                }}>
                Generate
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddReport;
