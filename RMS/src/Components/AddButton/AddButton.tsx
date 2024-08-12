import React, { FC } from "react";
import { IconButton } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';

interface AddButtonProps {
    onClick: () => void;
}

const AddButton: FC<AddButtonProps> = ({ onClick }) => {
    return (
        <IconButton onClick={onClick} sx={{ ml: 2, width: "auto", height: "auto" }}>
            <AddCircleIcon sx={{ fontSize: '3rem', color: '#8B0000' }} />
        </IconButton>
    );
};

export default AddButton;
