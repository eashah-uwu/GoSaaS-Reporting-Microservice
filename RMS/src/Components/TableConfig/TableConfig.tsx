import React, { useEffect, useState, FC } from "react";
import { Box, Button } from "@mui/material";
import Table from "../Table/Table";
import { setColumns } from "../Table/Columns/CreateColumns";
import Confirmation from "../ConfirmationDialogue/Confirmation";
import classes from "./TableConfig.module.css";
import AddButton from "../AddButton/AddButton";

interface TableConfigProps {
    data: any[];
    includeStatus: boolean;
    includeEdit: boolean;
    baseColumns: any[];
    pageSize: number;
    onSave: (updatedData: any[]) => void;
    rowIdAccessor: string;
    onDelete: (selectedIds: string[]) => void;
    onGroupStatusChange: (selectedIds: string[],selectedStatus:string) => void;
    onAddData: () => void;
    onEdit: (item: any) => void;
}

const TableConfig: FC<TableConfigProps> = ({ data, includeStatus, baseColumns, pageSize, onSave, rowIdAccessor, onDelete,onGroupStatusChange, onAddData, includeEdit, onEdit
}) => {
    const [initialData, setInitialData] = useState<any[]>(data);
    const [tableData, setTableData] = useState<any[]>(data);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [openStatusDialog, setOpenStatusDialog] = useState<boolean>(false);
    const [selectedDataId, setSelectedDataId] = useState<string>("");
    const [selectedDataIds, setSelectedDataIds] = useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string>("");
    const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);

    useEffect(() => {
        setTableData(data);
        setInitialData(data);
    }, [data]);

    useEffect(() => {
        const isChanged = JSON.stringify(initialData) !== JSON.stringify(tableData);
        setIsSaveEnabled(isChanged);
    }, [tableData, initialData]);

    const handleStatusChange = (id: string, newStatus: string) => {
            setTableData((prevData) =>
                prevData.map((dataItem) =>
                    dataItem[rowIdAccessor] === id ? { ...dataItem, status: newStatus } : dataItem
                )
            );
    };
    const handleDeleteSelected = (selectedIds: string[]) => {
        setSelectedDataIds(selectedIds)
        setOpenDialog(true)
    };
    const handleMultipleStatusChange = (selectedIds: string[], status: string) => {
        setSelectedStatus(status)
        setSelectedDataIds(selectedIds)
        setOpenStatusDialog(true);
    };
    const handleDeleteClick = (id: string) => {
        setSelectedDataId(id);
        setOpenDialog(true);
    };
    const handleDeleteConfirm = () => {
        if (selectedDataId == "") {
            onDelete(selectedDataIds);
        }
        else {
            onDelete([selectedDataId]);
        }
        setOpenDialog(false);
        setSelectedDataId("");
        setSelectedDataIds([]);
    };

    const handleDeleteCancel = () => {
        setOpenDialog(false);
        setSelectedDataId("");
        setSelectedDataIds([]);
    };
    const handleStatusConfirm = () => {
        onGroupStatusChange(selectedDataIds,selectedStatus);
        setOpenStatusDialog(false);
        setSelectedDataIds([]);
        setSelectedStatus("")
    };

    const handleStatusCancel = () => {
        setOpenStatusDialog(false);
        setSelectedDataIds([]);
        setSelectedStatus("")
    };



    const columns = setColumns(baseColumns, includeStatus, includeEdit, handleStatusChange, rowIdAccessor, onEdit, handleDeleteClick);
    const handleSave = async () => {
        const updatedData = tableData.map(dataItem => ({
            ...dataItem,
            isactive: dataItem.status === "active"
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
                {data.length == 0 && <p>No Data Found. Add using + Icon</p>}
                {filteredData && data.length > 0 && <Table data={filteredData} columns={columns} pageSize={pageSize} onDeleteSelected={handleDeleteSelected} onChangeStatusSelected={handleMultipleStatusChange} rowIdAccessor={rowIdAccessor} />}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {
                        rowIdAccessor !== "reportstatushistoryid" &&
                        <>

                            {data.length > 0 &&
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
                            }
                            <AddButton onClick={onAddData} />
                        </>
                    }
                </Box>
            </Box>

            <Confirmation
                open={openDialog}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                message="Are you sure you want to delete this application?"
            />
            <Confirmation
                open={openStatusDialog}
                onClose={handleStatusCancel}
                onConfirm={handleStatusConfirm}
                title={`Confirm Status Change to ${selectedStatus}`}
                message={`Are you sure you want to change the status of selected items to ${selectedStatus}?`}
            />
        </>
    );
};

export default TableConfig;