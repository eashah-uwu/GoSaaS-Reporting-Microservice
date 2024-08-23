import React, { FC, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "react-toastify";
import { StatusCodes } from "http-status-codes";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";

const schema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(25, "Name must be at most 25 characters")
    .refine((value) => !/^\d/.test(value), {
      message: "Name cannot start with a number",
    }),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(100, "Description must be at most 100 characters")
    .refine((value) => !/^\d/.test(value), {
      message: "Description cannot start with a number",
    }),
});

interface EditApplicationProps {
  open: boolean;
  onClose: () => void;
  applicationId: string;
  initialData: { name: string; description: string };
  onEditSuccess: (updatedData: any) => void;
}

const EditApplication: FC<EditApplicationProps> = ({
  open,
  onClose,
  applicationId,
  initialData,
  onEditSuccess,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  });

  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    reset(initialData);
  }, [initialData, reset]);

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/applications/${applicationId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === StatusCodes.OK) {
        toast.success("Application data updated successfully!");
        onEditSuccess(response.data.application);
        onClose();
      } else {
        toast.error("Failed to update Application");
        setError("name", {
          type: "manual",
          message: "Failed to update Application",
        });
      }
    } catch (error: any) {
      if (error.response?.data?.message === "Application name must be unique") {
        setError("name", {
          type: "manual",
          message: "Name must be unique, please choose another.",
        });
      } else {
        toast.error("Failed to update Application");
        setError("name", {
          type: "manual",
          message: "Error Updating Application",
        });
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Application</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                autoFocus
                margin="dense"
                id="name"
                label="Name"
                type="text"
                fullWidth
                required
                variant="standard"
                error={!!errors.name}
                helperText={errors.name?.message?.toString()}
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
                id="description"
                label="Description"
                type="text"
                fullWidth
                required
                variant="standard"
                error={!!errors.description}
                helperText={errors.description?.message?.toString()}
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditApplication;
