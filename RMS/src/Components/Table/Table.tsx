import React, { FC, useState } from 'react';
import { Paper, Table as MuiTable, TableBody, TableCell, TableHead, TableRow, TablePagination, TableContainer, Checkbox, IconButton } from "@mui/material";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import DeleteIcon from '@mui/icons-material/Delete';
import classes from "./Table.module.css";

interface TableProps {
  data: any[];
  columns: ColumnDef<any>[];
  pageSize: number;
  onDeleteSelected: (selectedIds: string[]) => void;
  rowIdAccessor: string;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  flex: 1,
  textAlign: 'center',
  overflow: 'hidden',
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: "#7d0e0e",
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  display: 'flex',
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const Table: FC<TableProps> = ({ data, columns, pageSize, onDeleteSelected, rowIdAccessor }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const { getHeaderGroups, getRowModel } = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = data.map((row) => row[rowIdAccessor]);
      setSelectedRows(newSelecteds);
      return;
    }
    setSelectedRows([]);
  };

  const handleClick = (id: string) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1),
      );
    }

    setSelectedRows(newSelected);
  };

  const handleDeleteSelected = () => {
    onDeleteSelected(selectedRows);
    setSelectedRows([]);
  };

  return (
    <div className={classes.main_body}>
      {selectedRows.length > 0 && (
        <IconButton
          color="primary"
          onClick={handleDeleteSelected}
          style={{ color: '#7d0e0e', float: "left" }}
        >
          <DeleteIcon sx={{ height: "2rem", width: "2rem" }} />
        </IconButton>
      )}
      <TableContainer component={Paper}>

        <MuiTable sx={{ minWidth: 700 }} aria-label="customized table">

          <TableHead>
            {getHeaderGroups().map((headerGroup, index) => (
              <StyledTableRow key={index}>
                <StyledTableCell padding="checkbox" sx={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
                    checked={data.length > 0 && selectedRows.length === data.length}
                    onChange={handleSelectAllClick}
                    style={{color:"white"}}
                  />
                </StyledTableCell>
                {headerGroup.headers.map((header, index) => (
                  <StyledTableCell key={index}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </StyledTableCell>
                ))}
              </StyledTableRow>
            ))}
          </TableHead>
          <TableBody>
            {getRowModel().rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
              const isItemSelected = selectedRows.indexOf(row.original[rowIdAccessor]) !== -1;
              return (
                <StyledTableRow
                  key={index}
                  hover
                  onClick={() => handleClick(row.original[rowIdAccessor])}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                >
                  <StyledTableCell padding="checkbox" sx={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Checkbox
                      checked={isItemSelected}
                      style={{color:"#7d0e0e"}}
                    />
                  </StyledTableCell>
                  {row.getVisibleCells().map((cell, index) => (
                    <StyledTableCell key={index} sx={{display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </StyledTableCell>
                  ))}
                </StyledTableRow>
              );
            })}
          </TableBody>
        </MuiTable>

      </TableContainer>


    </div>
  );
};

export default Table;
