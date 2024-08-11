import React, { useEffect, useState } from "react";
import axios from "axios";
import TableConfig from "../TableConfig/TableConfig";
import {  Pagination, FormControl } from '@mui/material';
import { Box, Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import classes from "./Dashboard.module.css"
import Filter from "../Filter/Filter";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import axios from "axios";

const Dashboard = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [tableData, setTableData] = useState<any[]>(applications);
    const [initialData, setInitialData] = useState<any[]>(applications);
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    const [total, setTotal] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [filters, setFilters] = useState<{ sortField?: string, sortOrder?: string, status?: string }>({});
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    

  const fetchApplications = async (
    page = 1,
    pageSize = 10,
    query = "",
    filters = {}
  ) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `http://localhost:3000/api/applications`,
        {
          params: { page, pageSize, query, filters },
        }
      );
      const processedData = data.data.map((app: any) => ({
        ...app,
        status: app.isdeleted ? "delete" : app.isactive ? "active" : "inactive",
      }));
      setApplications(processedData);
      setTotal(data.total);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(page, pageSize, searchQuery, filters);
  }, [page, pageSize, filters]);

  const handleSave = async (updatedItems: any[]) => {
    try {
      const requests = updatedItems.map((item) => {
        const { applicationid, name, createdat, isactive, isdeleted } = item;
        return axios.put(
          `http://localhost:3000/api/applications/${applicationid}`,
          {
            applicationid,
            name,
            createdat,
            isactive,
            isdeleted,
          }
        );
      });
      await Promise.all(requests);
      console.log("updated Items", updatedItems);
    } catch (error) {
      alert("Failed to update data");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    fetchApplications(1, pageSize, searchQuery, filters);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
        setPage(1);
    };
    const handleApplicationDelete=async(applicationid:string|null)=>{
        try{
            await axios.delete(`http://localhost:3000/api/applications/${applicationid}`);
            fetchApplications(page, pageSize, searchQuery, filters)
        }
        catch(e){
            console.log(e)
        }
    }
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
        }  catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response && error.response.status === 409) {
                    alert('Application name already exists. Please choose another name.');
                } else {
                    console.error("Failed to create application:", error);
                    alert('An error occurred. Please try again later.');
                }
            } else {
                console.error("An unexpected error occurred:", error);
                alert('An unexpected error occurred. Please try again later.');
            }
        }
    };

  const baseColumns = generateBaseColumns(applications);

    return (
        <div className={classes.dashboard_main}>
            <Box sx={{ float: "left", marginLeft: "7.5%" }}>
                <Filter columns={baseColumns} onFilterChange={handleFilterChange} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 2, marginRight: "7.5rem" }}>
                <TextField
                    label="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                />
                <Button onClick={handleSearchSubmit} variant="contained" size="medium" sx={{ ml: 1,color:"white",backgroundColor:"#7d0e0e" }}>
                    Search
                </Button>
            </Box>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && 
                <TableConfig data={applications} 
                             includeStatus={true} 
                             baseColumns={baseColumns} 
                             pageSize={pageSize} 
                             onSave={handleSave} 
                             rowIdAccessor="applicationid" 
                             onDelete={handleApplicationDelete}
            />}
            {!loading && !error &&
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: "center", gap: 2, marginBottom: 2 }}>
                    <Pagination sx={{ marginTop: "0.8rem" }} count={Math.ceil(total / pageSize)} page={page} onChange={handlePageChange} />
                    <FormControl sx={{display:"flex",justifyContent:"space-evenly",alignItems:"end",flexDirection:"row",minWidth: 120}} variant="outlined" size="small" >
                        <TextField
                            label="Items per page"
                            value={pageSize<total?pageSize:total}
                            onChange={handlePageSizeChange}
                            variant="standard"
                            type="number"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{ maxWidth: '6rem', '& input': { textAlign: 'center' } }}
                        />
                        <Box sx={{paddingBottom:"0.5rem",color:"black"}}>
                         out of {total} items
                        </Box>
                    </FormControl>
                    <IconButton onClick={handleAdd} sx={{ ml: 2, width: "auto", height: "auto" }}>
                        <AddCircleIcon sx={{ fontSize: '3rem', color: '#8B0000' }} />
                    </IconButton>
                </Box>

            }
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

        </div>
        
    );
}

export default Dashboard;
