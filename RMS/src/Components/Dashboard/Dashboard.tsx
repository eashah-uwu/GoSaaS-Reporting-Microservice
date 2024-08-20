import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import TableConfig from "../TableConfig/TableConfig";
import { Pagination, FormControl } from '@mui/material';
import { Box, Button, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import classes from "./Dashboard.module.css"
import Filter from "../Filter/Filter";
import { toast } from "react-toastify";
import AddApplication from "../AddApplication/AddApplication";
const Dashboard = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openAddApplication, setOpenAddApplication] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<{
    sortField?: string;
    sortOrder?: string;
    status?: string;
  }>({});

  const fetchApplications = async (
    page = 1,
    pageSize = 10,
    query = "",
    filters = {}
  ) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/applications`,
        {
          params: { page, pageSize, query, filters },
          headers: {
            Authorization: `Bearer ${token}`, 
          },
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
          `${import.meta.env.VITE_BACKEND_URL}/api/applications/${applicationid}`,
          {
            name,
            createdat,
            isactive,
            isdeleted,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );
      });
      await Promise.all(requests);
      toast.success("Updated Applications successfully!");
    } catch (error) {
      toast.error("Failed to update Applications!");
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

  const handleAddApplicationOpen = () => {
    setOpenAddApplication(true);
  };

  const handleAddApplicationClose = () => {
    setOpenAddApplication(false);
  };
  const handleAddApplication = (newApplication: any) => {
    setApplications((prevData) => [newApplication, ...prevData]);
  };

  const handleApplicationDelete = async (applicationid: string | null) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/applications/${applicationid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      fetchApplications(page, pageSize, searchQuery, filters);
    } catch (e) {
      console.log(e);
    }
  };
  const generateBaseColumns = (data: any[]) => {
    if (data.length === 0) return [];
    const sample = data[0];
    return Object.keys(sample)
      .filter(
        (key) =>
          key !== "isactive" &&
          key !== "isdeleted" &&
          key !== "applicationid" &&
          key !== "status"
      )
      .map((key) =>
        key === "createdat"
          ? { accessorKey: key, header: "Date Registered" }
          : {
            accessorKey: key,
            header: key.charAt(0).toUpperCase() + key.slice(1),
          }
      );
  };

  const baseColumns = generateBaseColumns(applications);

  return (
    <div className={classes.dashboard_main}>
      <Box sx={{ float: "left", marginLeft: "7.5%" }}>
        <Filter columns={baseColumns} onFilterChange={handleFilterChange} showStatusFilter={true} />
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          marginBottom: 2,
          marginRight: "7.5rem",
        }}
      >
        <TextField
          label="Search"
          value={searchQuery}
          onChange={handleSearchChange}
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        />
        <Button
          onClick={handleSearchSubmit}
          size="medium"
          sx={{
            backgroundColor: "#7d0e0e", color: "white",
            ":hover": { backgroundColor: "#7d0e0e", color: "white" }
          }}
        >
          Search
        </Button>
      </Box>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <TableConfig
          data={applications}
          includeStatus={true}
          baseColumns={baseColumns}
          pageSize={pageSize}
          onSave={handleSave}
          rowIdAccessor="applicationid"
          onDelete={handleApplicationDelete}
          onAddData={handleAddApplicationOpen} includeEdit={false} onEdit={function (item: any): void {
            throw new Error("Function not implemented.");
          } }        />
      )}
      {!loading && !error && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 2,
            marginBottom: 2,
          }}
        >
          <Pagination
            sx={{ marginTop: "0.8rem" }}
            count={Math.ceil(total / pageSize)}
            page={page}
            onChange={handlePageChange}
          />
          <FormControl
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "end",
              flexDirection: "row",
              minWidth: 120,
            }}
            variant="outlined"
            size="small"
          >
            <TextField
              label="Items per page"
              value={pageSize < total ? pageSize : total}
              onChange={handlePageSizeChange}
              variant="standard"
              type="number"
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: "6rem", "& input": { textAlign: "center" } }}
            />
            <Box sx={{ paddingBottom: "0.5rem", color: "black" }}>
              out of {total} items
            </Box>
          </FormControl>
          <AddApplication
            open={openAddApplication}
            onClose={handleAddApplicationClose}
            onAdd={handleAddApplication}
          />
        </Box>
      )}
    </div>
  );
};

export default Dashboard;
