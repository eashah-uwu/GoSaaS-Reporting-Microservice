import React, { useState } from "react";
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";

interface FilterProps {
  columns: { accessorKey: string; header: string }[];
  onFilterChange: (filters: any) => void;
  showStatusFilter: boolean;
}

const Filter: React.FC<FilterProps> = ({ columns, onFilterChange, showStatusFilter }) => {
  const [sortField, setSortField] = useState("None");
  const [sortOrder, setSortOrder] = useState("asc");
  const [status, setStatus] = useState("All");

  const handleSortFieldChange = (event: SelectChangeEvent<string>) => {
    setSortField(event.target.value);
    onFilterChange({ sortField: event.target.value, sortOrder, status });
  };

  const handleSortOrderChange = (event: SelectChangeEvent<string>) => {
    setSortOrder(event.target.value);
    onFilterChange({ sortField, sortOrder: event.target.value, status });
  };

  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatus(event.target.value);
    onFilterChange({ sortField, sortOrder, status: event.target.value });
  };

  return (
    <Box
      display="flex"
      justifyContent="end"
      alignItems="center"
      mb={2}
      sx={{
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "flex-start", sm: "center" },
        gap: 2,
      }}
    >
      <FormControl
        variant="outlined"
        size="small"
        sx={{ ml: { sm: 2 }, width: { xs: "100%", sm: "auto" } }}
      >
        <InputLabel>Sort By</InputLabel>
        <Select
          value={sortField}
          onChange={handleSortFieldChange}
          label="Sort By"
        >
          <MenuItem value="None">None</MenuItem>
          {columns.map((col) => (
            <MenuItem key={col.accessorKey} value={col.accessorKey}>
              {col.header}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        variant="outlined"
        size="small"
        sx={{ ml: { sm: 2 }, width: { xs: "100%", sm: "auto" } }}
      >
        <InputLabel>Order</InputLabel>
        <Select
          value={sortOrder}
          onChange={handleSortOrderChange}
          label="Order"
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </FormControl>
      {showStatusFilter &&
        <FormControl
          variant="outlined"
          size="small"
          sx={{ ml: { sm: 2 }, width: { xs: "100%", sm: "auto" } }}
        >
          <InputLabel>Status</InputLabel>
          <Select value={status} onChange={handleStatusChange} label="Status">
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </Select>
        </FormControl>
      }
    </Box>
  );
};

export default Filter;
