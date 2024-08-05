import React, { useEffect, useState, FC } from "react";
import { Box, Button } from "@mui/material";
import Table from "../Table/Table";
import { setColumns } from "../Table/Columns/CreateColumns";
import Confirmation from "../ConfirmationDialogue/Confirmation";
import classes from "./TableConfig.module.css";

interface TableConfigProps {
    data: any[];
    includeStatus: boolean;
    baseColumns:any[];
    pageSize:number;
    onSave: (updatedData: any[]) => void;
}

const TableConfig: FC<TableConfigProps> = ({ data, includeStatus,baseColumns,pageSize,onSave }) => {
    const [initialData, setInitialData] = useState<any[]>(data);
    const [tableData, setTableData] = useState<any[]>(data);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedDataId, setSelectedDataId] = useState<string | null>(null);
    const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);
 
    useEffect(() => {
        console.log("data",data)
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
                    dataItem.applicationid === id ? { ...dataItem, status: newStatus } : dataItem
                )
            );
        }
    };

    const handleDeleteConfirm = () => {
        setTableData((prevData) =>
            prevData.map((dataItem) =>
                dataItem.applicationid === selectedDataId ? { ...dataItem, status: "delete" } : dataItem
            )
        );
        setOpenDialog(false);
        setSelectedDataId(null);
    };

    const handleDeleteCancel = () => {
        setOpenDialog(false);
        setSelectedDataId(null);
    };
    
    const columns = setColumns(baseColumns, includeStatus, handleStatusChange);
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
        .filter((app: any) => app.status!=="delete")
    return (
        <>
            <Box padding={6}>
                {filteredData && <Table data={filteredData} columns={columns} pageSize={pageSize}/>}
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
            </Box>
            <Confirmation
                open={openDialog}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Confirm Deletion"
                message="Are you sure you want to delete this application?"
            />
        </>
    );
};

export default TableConfig;

