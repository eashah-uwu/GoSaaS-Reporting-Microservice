import React, { useState, useEffect } from "react";
import Navbar from "../Components/Navbar/Navbar";
import { Box, Typography, Select, MenuItem, TextField } from "@mui/material";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../State/store";
import Audit from "../Components/Audit/Audit";

const AuditPage = () => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [filters, setFilters] = useState<any>({
    user: "",
    module: "",
    event: "",
    dateFrom: "",
    dateTo: "",
  });

  const [users, setUsers] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [usersResponse, modulesResponse, eventsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/audit-trails/users`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/audit-trails/modules`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/audit-trails/events`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prevFilters: typeof filters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };
  

  return (
    <>
      <Navbar />
      <Typography variant="h4" sx={{ marginTop: "2rem", marginLeft: "10%" }}>
        Audit Overview
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", marginTop: "1rem", marginLeft: "10%", marginRight: "10%" }}>
        <Select
          label="User"
          value={filters.user || ""}
          onChange={(e) => handleFilterChange({ user: e.target.value })}
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
      {/* <Audit filters={filters} /> */}
    </>
  );
};

export default AuditPage;
