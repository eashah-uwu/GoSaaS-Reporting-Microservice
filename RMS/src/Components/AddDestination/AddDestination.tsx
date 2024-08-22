import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";
import axios from "axios";
import styles from "./AddDestination.module.css";
import { toast } from "react-toastify";
import { FC } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { StatusCodes } from "http-status-codes";
import { useForm, Controller, set } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DisabledByDefaultSharp } from "@mui/icons-material";

const destinationSchema = z.object({
  alias: z.string().max(255).nonempty("Alias is required"),
  destination: z.string().max(255).nonempty("Destination is required"),
  url: z.string().max(255).optional(),
  apiKey: z.string().max(255).optional(),
});

interface AddDestinationProps {
  open: boolean;
  onClose: () => void;
  onAddOrEdit: (destination: any) => void;
  applicationId: string;
  initialData?: any;
}

const AddDestination: FC<AddDestinationProps> = ({
  open,
  onClose,
  onAddOrEdit,
  applicationId,
  initialData,
}) => {
  const isEditing = Boolean(initialData);

  // Retrieve userId from Redux state
  const userId = useSelector((state: RootState) => state.auth.userId);
  const token = useSelector((state: RootState) => state.auth.token);
  const [disabled, setDisabled] = useState(true);
  const [destination, setDestination] = useState<string>("");

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(destinationSchema),
    defaultValues: {
      alias: "",
      destination: "aws",
      url: "",
      apiKey: "",
      ...initialData,
    },
  });

  const formData = watch();

  useEffect(() => {
    const fetch = async () => {
      if (initialData) {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/destinations/get-dest/${
              initialData.destinationid
            }`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const { destination } = response.data;
          setDestination(destination);
          reset({
            alias: initialData.alias || "",
            destination: destination || "aws",
            url: initialData.url || "",
            apiKey: initialData.apikey || "",
          });
        } catch (error) {
          console.error("Failed to fetch connection data", error);
        }
      }
    };

    fetch();
  }, [initialData, reset]);

  const onSubmit = async (data: any) => {
    try {
      const url = `${import.meta.env.VITE_BACKEND_URL}/api/destinations${
        isEditing ? `/${initialData.destinationid}` : ""
      }`;
      const method = isEditing ? "put" : "post";
      const saveResponse = await axios[method](
        url,
        {
          ...data,
          applicationId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (saveResponse.status === StatusCodes.OK) {
        toast.success(
          `Destination ${isEditing ? "updated" : "added"} successfully!`
        );
        onAddOrEdit(saveResponse.data.destination);
        handleClose();
      } else {
        toast.error(`Failed to ${isEditing ? "update" : "add"} destination.`);
      }
    } catch (error: any) {
      if (error.response && error.response.status === StatusCodes.CONFLICT) {
        setError("alias", { message: "Alias must be unique" });
      } else {
        toast.error(
          `Error ${
            isEditing ? "updating" : "adding"
          } destination. Please try again`
        );
      }
    }
  };

  const handleConnect = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/destinations/connect`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === StatusCodes.OK) {
        toast.success("Connection successful!");
        setDisabled(false);
      } else {
        toast.error("Connection failed. Please check the details.");
      }
    } catch (error) {
      toast.error("Error connecting to destination. Please try again.");
    }
  };
  const handleClose = () => {
    reset({
      alias: "",
      destination: "aws",
      url: "",
      apiKey: "",
    });
    setDisabled(true);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        {isEditing ? "Edit Destination" : "Add Destination"}
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
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
            </div>
            <div className={styles.formItem}>
              <Controller
                name="destination"
                control={control}
                render={({ field }) => (
                  <TextField
                    margin="dense"
                    label="Destination"
                    select
                    fullWidth
                    {...field}
                    error={!!errors.destination}
                    onChange={(e) => {
                      field.onChange(e);
                      setDisabled(true);
                    }}
                  >
                    <MenuItem value="aws">AWS</MenuItem>
                  </TextField>
                )}
              />
            </div>
          </div>
          <div className={styles.formContainer}>
            <div className={styles.formItem}>
              <Controller
                name="url"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="dense"
                    label="URL"
                    type="text"
                    fullWidth
                    error={!!errors.url}
                    helperText={errors.url?.message?.toString()}
                    onChange={(e) => {
                      field.onChange(e);
                      setDisabled(true);
                    }}
                  />
                )}
              />
            </div>
            <div className={styles.formItem}>
              <Controller
                name="apiKey"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    margin="dense"
                    label="API Key"
                    type="text"
                    fullWidth
                    error={!!errors.apiKey}
                    helperText={errors.apiKey?.message?.toString()}
                    onChange={(e) => {
                      field.onChange(e);
                      setDisabled(true);
                    }}
                  />
                )}
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
            {disabled ? (
              <Tooltip title="Please test the connection before saving">
                <span>
                  <Button
                    type="submit"
                    size="small"
                    disabled={disabled}
                    sx={{
                      backgroundColor: "grey",
                      color: "white",
                      ":hover": {
                        backgroundColor: "grey",
                        color: "white",
                      },
                    }}
                  >
                    {initialData ? "Update" : "Save"}
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                type="submit"
                size="small"
                disabled={disabled}
                sx={{
                  backgroundColor: "#7d0e0e",
                  color: "white",
                  ":hover": {
                    backgroundColor: "#7d0e0e",
                    color: "white",
                  },
                }}
              >
                {initialData ? "Update" : "Save"}
              </Button>
            )}
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDestination;
