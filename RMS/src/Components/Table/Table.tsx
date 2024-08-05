import React, { FC, useState } from 'react';
import { Paper, Table as MuiTable, TableBody, TableCell, TableHead, TableRow, TablePagination, TableContainer } from "@mui/material";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import classes from "./Table.module.css";

interface TableProps {
    data: any[];
    columns: ColumnDef<any>[];
    pageSize:number;
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    flex: 1,
    textAlign: 'center',
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

const Table: FC<TableProps> = ({ data, columns,pageSize }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(pageSize);

    const { getHeaderGroups, getRowModel } = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className={classes.main_body}>
            <TableContainer component={Paper}>
                <MuiTable sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        {getHeaderGroups().map((headerGroup, index) => (
                            <StyledTableRow key={index}>
                                {headerGroup.headers.map((header, index) => (
                                    <StyledTableCell key={index}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </StyledTableCell>
                                ))}
                            </StyledTableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {getRowModel().rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                            <StyledTableRow key={index}>
                                {row.getVisibleCells().map((cell, index) => (
                                    <StyledTableCell key={index}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </StyledTableCell>
                                ))}
                            </StyledTableRow>
                        ))}
                    </TableBody>
                </MuiTable>
                
            </TableContainer>
        </div>
    );
};

export default Table;
