import React, { useEffect, useState } from "react";
import axios from 'axios';
import TableConfig from "../TableConfig/TableConfig";
import classes from "./Dashboard.module.css"
import { TextField, Button, Box, Pagination } from '@mui/material';
const Dashboard = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(3);
    const [total, setTotal] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const fetchApplications = async (page = 1, pageSize = 10, query = "") => {
        try {
            setLoading(true);
            const endpoint = query ? 'search' : 'paginate';
            const { data } = await axios.get(`http://localhost:3000/api/applications/${endpoint}`, {
                 params: { page, pageSize, query }
             });
            console.log('heree')
            const processedData = data.data
                .map((app: any) => ({
                    ...app,
                    status: app.isDeleted ? "delete" : (app.isactive ? "active" : "inactive")
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
        fetchApplications(page, pageSize);
    }, [page, pageSize]);


    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleSearchSubmit = () => {
        setPage(1);
        fetchApplications(1, pageSize, searchQuery);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    const generateBaseColumns = (data: any[]) => {
        if (data.length === 0) return [];
        const sample = data[0];
        return Object.keys(sample)
            .filter(key => key !== 'isactive' && key !== 'isdeleted' && key !== "applicationid" && key !== "status")
            .map((key) => (
               
                    key == "createdat" ? { accessorKey: key, header: "Date Registered" } :
                        {
                            accessorKey: key,
                            header: key.charAt(0).toUpperCase() + key.slice(1),
                        }
                ));
    };

    const baseColumns = generateBaseColumns(applications);
    return (
        <div className={classes.dashboard_main}>  
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2,marginRight:7 }}>
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
            {!loading && !error && <Pagination sx={{marginLeft:5}} count={Math.ceil(total / pageSize)} page={page} onChange={handlePageChange} />}
        </div>
    );  
}

export default Dashboard;
