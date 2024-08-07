import React, { useEffect, useState, FC } from "react";
import { Box, Button, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import Table from "../Table/Table";
import { setColumns } from "../Table/Columns/CreateColumns";
import Confirmation from "../ConfirmationDialogue/Confirmation";
import classes from "./TableConfig.module.css";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import axios from "axios";

interface TableConfigProps {
    data: any[];
    includeStatus: boolean;
    baseColumns: any[];
    pageSize: number;
    onSave: (updatedData: any[]) => void;
    rowIdAccessor: string;
    onDelete: (selectedDataId:string | null) => void;
}

const TableConfig: FC<TableConfigProps> = ({ data, includeStatus, baseColumns, pageSize, onSave, rowIdAccessor,onDelete }) => {
    const [initialData, setInitialData] = useState<any[]>(data);
    const [tableData, setTableData] = useState<any[]>(data);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedDataId, setSelectedDataId] = useState<string | null>(null);
    const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');



    useEffect(() => {
        setTableData(data);
        setInitialData(data);
    }, [data]);

    useEffect(() => {
        const isChanged = JSON.stringify(initialData) !== JSON.stringify(tableData);
        setIsSaveEnabled(isChanged);
    }, [tableData, initialData]);

    const handleStatusChange = (id: string, newStatus: string) => {
        if (newStatus === "delete") {
            setSelectedDataId(id);
            setOpenDialog(true);
        } else {
            setTableData((prevData) =>
                prevData.map((dataItem) =>
                    dataItem[rowIdAccessor] === id ? { ...dataItem, status: newStatus } : dataItem
                )
            );
        }
    };

    const handleDeleteConfirm =  () => {
            onDelete(selectedDataId); 
            setOpenDialog(false);
            setSelectedDataId(null);
    };

    const handleDeleteCancel = () => {
        setOpenDialog(false);
        setSelectedDataId(null);
    };

    const handleAdd = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const userid = 4;
        const data = { name, description, userid };
        console.log(data);
        try {
            const response = await axios.post(`http://localhost:3000/api/applications`, data);
            if (response.status === 201) {
                const createdApplication = response.data.application;
                console.log(createdApplication)
                setTableData(prevData => [createdApplication, ...prevData]);
                setInitialData(prevData => [createdApplication, ...prevData]);
                console.log('Data submitted successfully');
                setOpen(false);
            } else {
                console.error('Failed to submit data');
            }
        } catch (error) {
            console.error('Error submitting data:', error);
        }
    };

    const columns = setColumns(baseColumns, includeStatus, handleStatusChange, rowIdAccessor);
    const handleSave = async () => {
        const updatedData = tableData.map(dataItem => ({
            ...dataItem,
            isactive: dataItem.status === "active",
            isdeleted: dataItem.status === "delete"
        }));
        const updatedItems = updatedData.filter((item, index) => {
            return JSON.stringify(item) !== JSON.stringify(initialData[index]);
        });
        onSave(updatedItems);
        setTableData(updatedData)
        setInitialData(updatedData);
        setIsSaveEnabled(false);
    };
    const filteredData = tableData
        .filter((app: any) => app.status !== "delete")
    return (
        <>
            <Box padding={6} sx={{ width: "90%", margin: "0 auto" }}>
                {filteredData && <Table data={filteredData} columns={columns} pageSize={pageSize} />}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <span className={classes.save_button_span}>
                        <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={handleSave}
                            disabled={!isSaveEnabled}
                        >
                            Save Changes
                        </Button>
                    </span>
                    <IconButton onClick={handleAdd} sx={{ ml: 2, width: "auto", height: "auto" }}>
                        <AddCircleIcon sx={{ fontSize: '3rem', color: '#8B0000' }} />
                    </IconButton>
                </Box>
            </Box>
            <Confirmation
                open={openDialog}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                message="Are you sure you want to delete this application?"
            />

            <Dialog open={open} onClose={handleClose}>
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
                        <Button onClick={handleClose} color="primary">
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

export default TableConfig;