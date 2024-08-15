import classes from "./AddApplication.module.css";
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

  const handleSubmit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const userid = 4;
    const data = { name, description, userid };
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/applications`,
        data
      );
      if (response.status === StatusCodes.CREATED) {
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
        console.error("Failed to submit data");
      }
    } catch (error) {
      console.error("Error submitting data:", error);
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
