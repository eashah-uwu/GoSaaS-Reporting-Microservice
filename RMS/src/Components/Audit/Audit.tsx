import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import TableConfig from "../TableConfig/TableConfig";
import { Box, CircularProgress, FormControl, Pagination, TextField, Select, MenuItem, InputLabel } from "@mui/material";

const Audit = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [auditData, setAuditData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [filters, setFilters] = useState({
    createdBy: "",
    module: "",
    event: "",
    dateFrom: "",
    dateTo: "",
    sortField: "",
    sortOrder: "",
    status:true,
  });

  const [users, setUsers] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [usersResponse, modulesResponse, eventsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/audit-trails/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/audit-trails/modules`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/audit-trails/events`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUsers(usersResponse.data);
        setModules(modulesResponse.data);
        setEvents(eventsResponse.data);
      } catch (error) {
        console.error("Failed to fetch filter data", error);
      }
    };

    fetchFilters();
  }, [token]);

  const fetchAuditData = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/audit-trails`,
        {
          params: { page, pageSize, ...filters },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAuditData(data);
      setTotal(data.length);
    } catch (error) {
      console.log("Error fetching audit data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData(page, pageSize, filters);
  }, [page, pageSize, filters]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setPage(1);
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  const generateBaseColumns = (data: any[]) => {
    if (data.length === 0) return [];
    const sample = data[0];
    return Object.keys(sample)
      .filter((key) => key !== "id")
      .map((key) => ({
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1),
      }));
  };

  const baseColumns = generateBaseColumns(auditData);

  return (
    <Box sx={{ marginTop: "2rem", marginLeft: "10%", marginRight: "10%" }}>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ marginBottom: "1rem", marginTop: "1rem" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", marginTop: "1rem", marginLeft: "10%", marginRight: "10%" }}>
            <Select
              label="User"
              value={filters.createdBy || ""}
              onChange={(e) => handleFilterChange({ createdBy: e.target.value })}
              displayEmpty
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Users</MenuItem>
              {users.map((user) => (
                <MenuItem key={user} value={user}>
                  {user}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Module"
              value={filters.module || ""}
              onChange={(e) => handleFilterChange({ module: e.target.value })}
              displayEmpty
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Modules</MenuItem>
              {modules.map((module) => (
                <MenuItem key={module} value={module}>
                  {module}
                </MenuItem>
              ))}
            </Select>
            <Select
              label="Event"
              value={filters.event || ""}
              onChange={(e) => handleFilterChange({ event: e.target.value })}
              displayEmpty
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="">All Events</MenuItem>
              {events.map((event) => (
                <MenuItem key={event} value={event}>
                  {event}
                </MenuItem>
              ))}
            </Select>
            <TextField
              label="Date From"
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="Date To"
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-start", marginBottom: "1rem", marginTop: "1rem", marginLeft: "10%", marginRight: "10%" }}>
            <FormControl sx={{ minWidth: 150, marginRight: 5 }}>
              <InputLabel>Sort Field</InputLabel>
              <Select
                label="Sort By"
                value={filters.sortField}
                onChange={(e) => handleFilterChange({ sortField: e.target.value })}
              >
                <MenuItem value="None">None</MenuItem>
                {baseColumns.map((col) => (
                  <MenuItem key={col.accessorKey} value={col.accessorKey}>
                    {col.header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 , marginRight: 5}}>
              <InputLabel>Sort Order</InputLabel>
              <Select
                label="Sort Order"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange({ sortOrder: e.target.value })}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={filters.status === true ? 'true' : filters.status === false ? 'false' : ''}
                onChange={(e) => handleFilterChange({ status: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
                displayEmpty
              >
                <MenuItem value=""></MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>


            <TableConfig
              data={auditData}
              includeStatus={false}
              baseColumns={baseColumns}
              pageSize={pageSize}
              onSave={() => {}}
              onDelete={() => {}}
              rowIdAccessor="id"
              includeEdit={false}
              onAddData={() => {}}
              onEdit={() => {}}
              onGroupStatusChange={() => {}}
            />
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
                  {total} items
                </Box>
              </FormControl>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default Audit;
