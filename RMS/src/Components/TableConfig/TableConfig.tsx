import React, { useEffect, useState, FC } from "react";
import { Box, Button } from "@mui/material";
import Table from "../Table/Table";
import { setColumns } from "../Table/Columns/CreateColumns";
import Confirmation from "../ConfirmationDialogue/Confirmation";
import Filter from "../Filter/Filter";
import classes from "./TableConfig.module.css";

interface TableConfigProps {
    data: any[];
    includeStatus: boolean;
    baseColumns:any[];
}

const TableConfig: FC<TableConfigProps> = ({ data, includeStatus,baseColumns }) => {
    const [initialData, setInitialData] = useState<any[]>(data);
    const [tableData, setTableData] = useState<any[]>(data);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedDataId, setSelectedDataId] = useState<string | null>(null);
    const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);
    const [filters, setFilters] = useState({ searchText: "", sortField: "", sortOrder: "asc" });

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

    const handleFilterChange = (filters: any) => {
        setFilters(filters);
    };

    
    const columns = setColumns(baseColumns, includeStatus, handleStatusChange);

    // const filteredData = tableData
    //     .filter((dataItem) => !dataItem.isdeleted)
    //     .filter((dataItem) => {
    //         return Object.values(dataItem).some(
    //             (value) =>
    //                 typeof value === "string" &&
    //                 value.toLowerCase().includes(filters.searchText.toLowerCase())
    //         );
    //     })
    //     .sort((a, b) => {
    //         if (!filters.sortField || filters.sortField === "None") return 0;
    //         const aValue = a[filters.sortField];
    //         const bValue = b[filters.sortField];
    //         if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
    //         if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
    //         return 0;
    //     });

    const handleSave = async () => {
        try {
            const updatedData = tableData.map(dataItem => ({
                ...dataItem,
                isactive: dataItem.status === "active",
                isdeleted: dataItem.status === "delete"
            }));
            console.log("updated data",updatedData)
            setInitialData(tableData);
            setIsSaveEnabled(false);
            alert("Data successfully updated");
        } catch (error) {
            alert("Failed to update data");
        }
    };
    // const filteredData = tableData
    //     .filter((dataItem) => dataItem.status !== "delete")
    const filteredData = tableData
        .filter((app: any) => app.status!=="delete")
    return (
        <>
            <Box padding={6}>
                {/* <Filter
                    columns={includeStatus ? [...baseColumns, { accessorKey: "status", header: "Status" }] : baseColumns}
                    onFilterChange={handleFilterChange}
                /> */}
                {filteredData && <Table data={filteredData} columns={columns} />}
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
