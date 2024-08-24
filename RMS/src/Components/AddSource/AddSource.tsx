import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Tooltip,
} from "@mui/material";
import axios from "axios";
import styles from "./AddSource.module.css";
import { toast } from "react-toastify";
import { FC } from "react";
import { StatusCodes } from "http-status-codes";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Source } from "@mui/icons-material";

const connectionSchema = z.object({
  alias: z
    .string()
    .min(3, "Alias must be at least 3 characters")
    .max(25, "Alias should not exceed 25 characters")
    .optional(),
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username should not exceed 50 characters")
    .optional(),
  host: z
    .string()
    .min(1, "Host is required")
    .max(255, "Host should not exceed 255 characters")
    .optional(),
  port: z.preprocess(
    (val) => {
      if (typeof val === "string") val = parseInt(val, 10);
      return val;
    },
    z
      .number()
      .int()
      .positive()
      .max(65535)
      .or(z.nan())
      .refine((val) => !isNaN(val), {
        message: "Port must be a valid integer between 1 and 65535",
      })
  ),
  database: z
    .string()
    .min(1, "Database name is required")
    .max(50, "Database name should not exceed 50 characters")
    .optional(),
  type: z
    .string()
    .min(1, "Type is required")
    .max(50, "Type should not exceed 50 characters")
    .optional(),
  password: z
    .string()
    .min(8, "Password should be at least 8 characters")
    .max(50, "Password should not exceed 50 characters")
    .optional(),
  schema: z
    .string()
    .min(1, "Schema Name is required")
    .max(50, "Schema Name should not exceed 50 characters")
    .optional(), // Add the new field here
});

interface AddSourceProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
  onEdit?: (updatedSource: any) => void;
  applicationId: string;
  sourceToEdit?: any;
}

const AddSource: FC<AddSourceProps> = ({
  open,
  onClose,
  onAdd,
  onEdit,
  applicationId,
  sourceToEdit,
}) => {
  const userId = useSelector((state: RootState) => state.auth.userId);
  const token = useSelector((state: RootState) => state.auth.token);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      alias: "",
      username: "",
      host: "",
      port: "",
      database: "",
      type: "",
      password: "",
      schema: "", // Add the default value here
    },
  });

  const [saveDisabled, setSaveDisabled] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [wasTested, setWasTested] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (sourceToEdit) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/connections/get-con/${
              sourceToEdit.connectionid
            }`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const { username, password } = response.data;
          setUsername(username);
          setPassword(password);
          reset({
            alias: sourceToEdit.alias || "",
            username: username || "",
            host: sourceToEdit.host || "",
            port: sourceToEdit.port || "",
            database: sourceToEdit.database || "",
            type: sourceToEdit.type || "",
            password: password || "",
            schema: sourceToEdit.schema || "", // Add this line
          });
               setSaveDisabled(true);
          setWasTested(false); 
        } catch (error) {
          console.error("Failed to fetch connection data", error);
        }
      }
    };

    fetch();
  }, [sourceToEdit, reset]);

  const onSubmit = async (formData: any) => {
    if (saveDisabled) {
      toast.error("Please test the connection before saving!");
      return;
    }

    try {
      const payload = { ...formData, applicationId };

      if (sourceToEdit) {
        const response = await axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/connections/${
            sourceToEdit.connectionid
          }`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === StatusCodes.OK) {
          toast.success("Connection updated successfully!");
          onEdit && onEdit(response.data.connection);
        } else {
          toast.error("Failed to update connection: " + response.data.message);
        }
      } else {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/connections`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === StatusCodes.CREATED) {
          toast.success("Connection added successfully!");
          onAdd();
        } else {
          toast.error("Failed to add connection: " + response.data.message);
        }
      }

      setSaveDisabled(true);
      setWasTested(false); 
      handleClose();
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;

        // Check for specific status codes or messages
        if (status === StatusCodes.CONFLICT) {
          if (data.message === "Alias name must be unique") {
            setError("alias", { message: "Alias must be unique" });
          } else if (
            data.message === "A connection with the same details already exists"
          ) {
            toast.error(
              "Failed to save connection: Duplicate connection details found."
            );
          } else {
            toast.error("Failed to save connection: " + data.message);
          }
        } else {
          toast.error("Failed to save connection: " + error.message);
        }
      } else {
        toast.error("Failed to save connection: " + error.message);
      }
    }
  };

  const handleConnect = async (data: any) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/connections/test-connection`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success("Connection successful!");
        setSaveDisabled(false);
        setWasTested(true);
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
    reset({
      alias: "",
      username: "",
      host: "",
      port: "",
      database: "",
      type: "",
      password: "",
      schema: "",
    });
    setSaveDisabled(true);
    setWasTested(false); 

    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{sourceToEdit ? "Edit Source" : "Add Source"}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
              <Controller
                name="alias"
                control={control}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="Alias"
                    fullWidth
                    {...field}
                    error={!!errors.alias}
                    helperText={errors.alias?.message}
                  />
                )}
              />
            </div>
            <div className={styles.formItem}>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="username"
                    fullWidth
                    {...field}
                    error={!!errors.username}
                    helperText={errors.username?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true);
                      setWasTested(false);
                    }}
                  />
                )}
              />
            </div>
            <div className={styles.formItem}>
              <Controller
                name="host"
                control={control}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="Host"
                    fullWidth
                    {...field}
                    error={!!errors.host}
                    helperText={errors.host?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true);
                      setWasTested(false);
                    }}
                  />
                )}
              />
            </div>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
              <Controller
                name="port"
                control={control}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="Port"
                    fullWidth
                    type="number" // Ensure only numeric values can be input
                    {...field}
                    error={!!errors.port}
                    helperText={errors.port?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true);
                      setWasTested(false);

                    }}
                    InputProps={{ inputProps: { min: 1, max: 65535 } }} // Optional: restrict range
                  />
                )}
              />
            </div>
            <div className={styles.formItem}>
              <Controller
                name="database"
                control={control}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="Database"
                    fullWidth
                    {...field}
                    error={!!errors.database}
                    helperText={errors.database?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true);
                      setWasTested(false);
                    }}
                  />
                )}
              />
            </div>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
              <Controller
                name="schema"
                control={control}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="Schema Name"
                    fullWidth
                    {...field}
                    error={!!errors.schema}
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true);
                      setWasTested(false);
                    }}
                    helperText={errors.schema?.message}
                  />
                )}
              />
            </div>
            <div className={styles.formItem}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="Type"
                    select
                    fullWidth
                    {...field}
                    error={!!errors.type}
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true); 
                      setWasTested(false);
                    }}
                    helperText={errors.type?.message}
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    <MenuItem value="Oracle">Oracle</MenuItem>
                    <MenuItem value="PostgreSQL">PostgreSQL</MenuItem>
                  </TextField>
                )}
              />
            </div>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="Password"
                    type="password"
                    fullWidth
                    {...field}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true);
                      setWasTested(false);
                    }}
                  />
                )}
              />
            </div>
          </div>
          <DialogActions>
            <Button
              size="small"
              onClick={handleSubmit(handleConnect)}
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
            {saveDisabled ? (
              <Tooltip title="Please test the connection before saving">
                <span>
                  <Button
                    type="submit"
                    size="small"
                    disabled={saveDisabled}
                    sx={{
                      backgroundColor: "grey",
                      color: "white",
                      ":hover": {
                        backgroundColor: "grey",
                        color: "white",
                      },
                    }}
                  >
                    {sourceToEdit ? "Update" : "Save"}
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                type="submit"
                size="small"
                disabled={saveDisabled}
                sx={{
                  backgroundColor: "#7d0e0e",
                  color: "white",
                  ":hover": {
                    backgroundColor: "#7d0e0e",
                    color: "white",
                  },
                }}
              >
                {sourceToEdit ? "Update" : "Save"}
              </Button>
            )}
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSource;
