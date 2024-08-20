import classes from "./AddApplication.module.css";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { toast } from "react-toastify";
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
import { useState, FC } from "react";

interface AddApplicationProps {
  open: boolean;
  onClose: () => void;
  onAdd: (newApplication: any) => void;
}

const AddApplication: FC<AddApplicationProps> = ({ open, onClose, onAdd }) => {

  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const token = useSelector((state: RootState) => state.auth.token);

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const data = { name, description};
    console.log(data);
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
        const createdApplication = response.data.application;
        const { applicationid, name, createdat, isactive, isdeleted, status } =
          createdApplication;
        onAdd({
          applicationid,
          name,
          createdat,
          isactive,
          isdeleted,
          status,
        });
        onClose();
      } else {
        toast.error("Failed to add Application");
      }
    } catch (error) {
      toast.error("Error Adding Application");
    }
  };
  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add Application</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Name"
              type="text"
              fullWidth
              variant="standard"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              margin="dense"
              id="description"
              label="Description"
              type="text"
              fullWidth
              variant="standard"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
