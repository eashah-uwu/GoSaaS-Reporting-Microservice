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
import { StatusCodes } from "http-status-codes";
import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


const schema = z.object({
  alias: z.string().min(3, "Alias must be atleast 3 characters").max(25, "Alias should not exceed 25 characters"),
  description: z.string().min(10, "Alias must be atleast 3 characters").max(125, "Alias should not exceed 25 characters"),
});

interface AddReportProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newReport: any) => void;
  onEdit?: (updatedReport: any) => void;
  applicationId: string;
  report?: any; 
}

const AddReport: FC<AddReportProps> = ({
  open,
  onClose,
  onAdd,
  onEdit,
  applicationId,
  report,
}) => {
  const [sources, setSources] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [storedProcedures, setStoredProcedures] = useState<any[]>([]);
  const [parameters, setParameters] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const userid = useSelector((state: RootState) => state.auth.userId || "");
  const token = useSelector((state: RootState) => state.auth.token);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      alias: report?.title || "",
      description: report?.description || "",
      source: report?.sourceconnectionid || "",
      destination: report?.destinationid || "",
      storedProcedure: report?.storedProcedure || "",
      parameter: report?.parameter || "",
      file: "",
    },
  });
  
  const formData = watch();

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [sourcesResponse, destinationsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/connections/${applicationId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/destinations/${applicationId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
  
        const fetchedSources = sourcesResponse.data.data;
        const fetchedDestinations = destinationsResponse.data.data;
  
        setSources(fetchedSources);
        setDestinations(fetchedDestinations);
  
        if (report) {
          const source = fetchedSources.find(
            (source: any) => source.connectionid === report.sourceconnectionid
          );
          const destination = fetchedDestinations.find(
            (destination: any) => destination.destinationid === report.destinationid
          );
  
          
          console.log("this is the form im setting", formData);
          if (source) {
            const storedProcedureResponse = await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/connections/get-stored-procedures`,
              { id: source.connectionid },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
  
            if (storedProcedureResponse.data.success) {
              setStoredProcedures(storedProcedureResponse.data.data);
              setValue("storedProcedure", report.storedProcedure || "");
              setValue("parameter", report.parameter || "");
              setParameters(report.parameter || "");
            } else {
              toast.error("Failed to load stored procedures: " + storedProcedureResponse.data.message);
            }
          }

          setValue("alias", report.title || "");
          setValue("description", report.description || "");
          setValue("source", source ? source.connectionid : "");
          setValue("destination", destination ? destination.destinationid : "");
        
          
        } else {
          reset({
            alias: "",
            description: "",
            source: "",
            destination: "",
            storedProcedure: "",
            parameter: "",
          });
          setParameters("");
        }
      } catch (error) {
        toast.error("Failed to load dropdown data");
      }
    };
  
    fetchDropdownData();
  }, [applicationId, token, report]);
  


const handleChange = async (e: any) => {
  const { name, value } = e.target;
  

  if (name === "source") {
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
    setValue(name, value);
    setValue('parameter', selectedProc.parameter_list || "");
    setParameters(selectedProc.parameter_list);
  };

  const handleSubmitForm = async (data: any) => {

    console.log("i am here")
    if (!file && !report) {
      toast.error("Please upload an .xls file.");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("alias", formData.alias);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("source", formData.source);
      formDataToSend.append("destination", formData.destination);
      formDataToSend.append("storedProcedure", formData.storedProcedure);
      formDataToSend.append("parameter", formData.parameter);
      if (file) {
        formDataToSend.append("file", file);
      }
      formDataToSend.append("applicationid", applicationId);
       
      formDataToSend.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      
      if (report) {
        // Editingreport existing 
        formDataToSend.forEach((value, key) => {
          console.log(`${key}: ${value}`);
        });
        
   
        const response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/reports/${report.reportid}`,
            formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === StatusCodes.OK) {
          toast.success("Report updated successfully!");
          onEdit?.(response.data.report);
          handleClose();
        } else {
          toast.error("Failed to update report.");
        }
      } else {
        // Creating new report
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/reports`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === StatusCodes.CREATED) {
          toast.success("Report created successfully!");
          onAdd(response.data.report);
          handleClose();
        } else {
          toast.error("Failed to create report.");
        }
      }
    } catch (error: any) {
      if (error.response && error.response.status === StatusCodes.CONFLICT) {
        toast.error("Alias must be unique" );
      } else {
        toast.error("Error creating report. Please try again.");
      }
      
    }
  };
  console.log("Errors:", errors);


  const handleClose = () => {
    reset({
      alias: '',
      description: '',
      source: '',
      destination: '',
      storedProcedure: '',
      parameter: ''
    });
    setFile(null);
    setParameters("");
    onClose();
  };


  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{report ? "Edit Report" : "Configure Report"}</DialogTitle>
        <DialogContent>

        <form onSubmit={handleSubmit (handleSubmitForm) }>

            <div className="formContainer">
              <Controller
                name="alias"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="dense"
                    label="Alias"
                    type="text"
                    fullWidth
                    error={!!errors.alias}
                    helperText={errors.alias?.message?.toString()}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="dense"
                    label="Description"
                    type="text"
                    fullWidth
                    error={!!errors.description}
                    helperText={errors.description?.message?.toString()}
                  />
                )}
              />
              <div className="formRow">
                <div className="formItem">
                  <Controller
                    name="source"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="dense"
                        label="Source"
                        select
                        fullWidth
                        error={!!errors.source}
                        helperText={errors.source?.message?.toString()}
                        onChange={(e) => {
                          field.onChange(e);
                          handleChange(e);
                        }}
                      >
                        <MenuItem value="" hidden>
                          Select Source
                        </MenuItem>
                        {sources.map((source) => (
                          <MenuItem
                            key={source.connectionid}
                            value={source.connectionid}
                          >
                            {source.alias}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </div>
                <div className="formItem">
                  <Controller
                    name="destination"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="dense"
                        label="Destination"
                        select
                        fullWidth
                        error={!!errors.destination}
                        helperText={errors.destination?.message?.toString()}
                      >
                        <MenuItem value="" hidden>
                          Select Destination
                        </MenuItem>
                        {report ? (
                          <MenuItem
                            key={report.destinationid}
                            value={report.destinationid}
                          >
                            {report.destination}
                          </MenuItem>
                        ) : (
                          destinations.map((destination) => (
                            <MenuItem
                              key={destination.destinationid}
                              value={destination.destinationid}
                            >
                              {destination.alias}
                            </MenuItem>
                          ))
                        )}
                      </TextField>
                    )}
                  />
                </div>
              </div>
              <div className="formRow">
                <div className="formItem">
                  <Controller
                    name="storedProcedure"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="dense"
                        label="Stored Procedure"
                        select
                        fullWidth
                        error={!!errors.storedProcedure}
                        helperText={errors.storedProcedure?.message?.toString()}
                        onChange={(e) => {
                          field.onChange(e);
                          handleProcedureSelect(e);
                        }}
                      >
                        <MenuItem value="" hidden>
                          Select Stored Procedure
                        </MenuItem>
                        {storedProcedures.map((proc, index) => (
                          <MenuItem key={index} value={proc.procedure_name}>
                            {proc.procedure_name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </div>
                <div className="formItem">
                  <Controller
                    name="parameter"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        margin="dense"
                        label="Parameter"
                        type="text"
                        InputProps={{
                          readOnly: true,
                        }}
                        fullWidth
                      />
                    )}
                  />
                </div>
              </div>
              <div className="formRow">
                <input
                  accept=".xsl"
                  id="upload-file"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>
              <DialogActions className="formActions">
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
                  sx={{
                    backgroundColor: "#7d0e0e",
                    color: "white",
                    ":hover": {
                      backgroundColor: "#7d0e0e",
                      color: "white",
                    },
                  }}
                >
                  {report ? "Update" : "Generate"}
                </Button>
              </DialogActions>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddReport;