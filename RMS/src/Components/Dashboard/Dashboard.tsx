import React, { useEffect, useState } from "react";
import axios from 'axios';
import TableConfig from "../TableConfig/TableConfig";
import { TextField, Button, Box, Pagination, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import classes from "./Dashboard.module.css"
import Filter from "../Filter/Filter";
const Dashboard = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filters, setFilters] = useState<{ sortField?: string, sortOrder?: string }>({});

    const fetchApplications = async (page = 1, pageSize = 10, query = "", filters = {}, sortField = "", sortOrder = "asc") => {
        try {
            setLoading(true);
            const { data } = await axios.get(`http://localhost:3000/api/applications/search`, {
                params: { page, pageSize, query, filters, sortField, sortOrder }
            });
            const processedData = data.data.map((app: any) => ({
                ...app,
                status: app.isdeleted ? "delete" : (app.isactive ? "active" : "inactive")
            }));
            setApplications(processedData);
            setTotal(data.total);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications(page, pageSize, searchQuery, filters, filters.sortField, filters.sortOrder);
    }, [page, pageSize, filters]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = () => {
        setPage(1);
        fetchApplications(1, pageSize, searchQuery, filters);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPageSize(Number(event.target.value));
        setPage(1);
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
        setPage(1);
        fetchApplications(1, pageSize, searchQuery, newFilters, newFilters.sortField, newFilters.sortOrder);
    };

    const generateBaseColumns = (data: any[]) => {
        if (data.length === 0) return [];
        const sample = data[0];
        return Object.keys(sample)
            .filter(key => key !== 'isactive' && key !== 'isdeleted' && key !== "applicationid" && key !== "status")
            .map((key) => (
                key === "createdat" ? { accessorKey: key, header: "Date Registered" } :
                    {
                        accessorKey: key,
                        header: key.charAt(0).toUpperCase() + key.slice(1),
                    }));
    };

    const baseColumns = generateBaseColumns(applications);

    return (
        <div className={classes.dashboard_main}>
            <Box sx={{float:"left"}}>
            <Filter columns={baseColumns} onFilterChange={handleFilterChange} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 2 }}>
                <TextField
                    label="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                />
                <Button onClick={handleSearchSubmit} variant="contained" size="medium" sx={{ ml: 1 }}>
                    Search
                </Button>
            </Box>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && <TableConfig data={applications} includeStatus={true} baseColumns={baseColumns} />}
            {!loading && !error &&

                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: "center", gap: 2, marginBottom: 2 }}>

                    <Pagination sx={{ marginTop: "0.8rem" }} count={Math.ceil(total / pageSize)} page={page} onChange={handlePageChange} />


                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <TextField
                            label="Items per page"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            variant="standard"
                            type="number"
                            size="small"
                        />
                    </FormControl>
                </Box>
            }
        </div>
    );
}

export default Dashboard;