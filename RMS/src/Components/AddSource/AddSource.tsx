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
    .max(255, "Alias should not exceed 255 characters")
    .optional(),
  username: z
    .string()
    .max(255, "Username should not exceed 255 characters")
    .optional(),
  host: z.string().max(255, "Host should not exceed 255 characters").optional(),
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
    .max(255, "Database should not exceed 255 characters")
    .optional(),
  type: z.string().max(50, "Type should not exceed 50 characters").optional(),
  password: z
    .string()
    .max(255, "Password should not exceed 255 characters")
    .optional(),
  schema: z
    .string()
    .max(255, "Schema Name should not exceed 255 characters")
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
      handleClose();
    } catch (error: any) {
      if (error.response && error.response.status === StatusCodes.CONFLICT) {
        setError("alias", { message: "Alias must be unique" });
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
    });
    setSaveDisabled(true); // Ensure Save button is disabled on close

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
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true); // Re-disables the save button on field change
                    }}
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
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true); // Re-disables the save button on field change
                    }}
                    helperText={errors.username?.message}
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
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true); // Re-disables the save button on field change
                    }}
                    helperText={errors.host?.message}
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
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true); // Re-disables the save button on field change
                    }}
                    helperText={errors.port?.message}
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
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true); // Re-disables the save button on field change
                    }}
                    helperText={errors.database?.message}
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
                      setSaveDisabled(true); // Re-disables the save button on field change
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
                      setSaveDisabled(true); // Re-disables the save button on field change
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
                    onChange={(e) => {
                      field.onChange(e);
                      setSaveDisabled(true); // Re-disables the save button on field change
                    }}
                    helperText={errors.password?.message}
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
