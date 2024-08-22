import classes from "./AddApplication.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
} from "@mui/material";
import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be at most 255 characters"),
  description: z.string().optional(),
});

interface AddApplicationProps {
  open: boolean;
  onClose: () => void;
  onAdd: () => void;
}

const AddApplication: FC<AddApplicationProps> = ({ open, onClose, onAdd }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const token = useSelector((state: RootState) => state.auth.token);

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/applications`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === StatusCodes.CREATED) {
        toast.success("Application created successfully!");
        reset();
        const createdApplication = response.data.application;
        const { applicationid, name, createdat, isactive, isdeleted, status } =
          createdApplication;
        onAdd();
        onClose();
      } else {
        toast.error("Failed to add Application");
        setError("name", {
          type: "manual",
          message: "Failed to add Application",
        });
      }
    } catch (error: any) {
      if (error.response?.data?.message === "Application name must be unique") {
        setError("name", {
          type: "manual",
          message: "Name must be unique, please choose another.",
        });
      } else {
        toast.error("Failed to add Application");
        setError("name", {
          type: "manual",
          message: "Error Adding Application",
        });
      }
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add Application</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Controller
              name="name"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  autoFocus
                  margin="dense"
                  id="name"
                  label="Name"
                  type="text"
                  fullWidth
                  variant="standard"
                  error={!!errors.name}
                  helperText={errors.name?.message?.toString()}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="dense"
                  id="description"
                  label="Description"
                  type="text"
                  fullWidth
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
    </>
  );
};

export default AddApplication;
