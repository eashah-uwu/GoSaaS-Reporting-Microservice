import React, { useState } from 'react';
import { Box, TextField, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

interface FilterProps {
    columns: { accessorKey: string; header: string }[];
    onFilterChange: (filters: any) => void;
}

const Filter: React.FC<FilterProps> = ({ columns, onFilterChange }) => {
    const [searchText, setSearchText] = useState('');
    const [sortField, setSortField] = useState('None');
    const [sortOrder, setSortOrder] = useState('asc');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchText(event.target.value);
        onFilterChange({ searchText: event.target.value, sortField, sortOrder });
    };

    const handleSortFieldChange = (event: SelectChangeEvent<string>) => {
        setSortField(event.target.value);
        onFilterChange({ searchText, sortField: event.target.value, sortOrder });
    };

    const handleSortOrderChange = (event: SelectChangeEvent<string>) => {
        setSortOrder(event.target.value);
        onFilterChange({ searchText, sortField, sortOrder: event.target.value });
    };

    return (
        <Box display="flex" justifyContent="end" alignItems="center" mb={2}>
            <FormControl variant="outlined" size="small" sx={{ ml: 2 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                    value={sortField}
                    onChange={handleSortFieldChange}
                    label="Sort By"
                >
                    <MenuItem value="None">None</MenuItem>
                    {columns.map((col) => (
                        <MenuItem key={col.accessorKey} value={col.accessorKey}>{col.header}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ ml: 2 }}>
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
            
            <TextField
                label="Search"
                variant="outlined"
                value={searchText}
                onChange={handleSearchChange}
                size="small"
                sx={{ ml: 2 }}
            />
        </Box>
    );
};

export default Filter;
