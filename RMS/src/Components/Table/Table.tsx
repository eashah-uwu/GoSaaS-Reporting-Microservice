import React, { FC, useEffect, useState } from 'react';
import { Paper, Table as MuiTable, TableBody, TableCell, TableHead, TableRow, TablePagination, TableContainer } from "@mui/material";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { styled } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import classes from "./Table.module.css";

interface TableProps {
    data: any[];
    columns: ColumnDef<any>[];
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: "#7d0e0e",
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const Table: FC<TableProps> = ({ data, columns }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const { getHeaderGroups, getRowModel } = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div className={classes.main_body}>
            <TableContainer component={Paper}>
                <MuiTable sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        {getHeaderGroups().map((headerGroup,index) => (
                            <TableRow key={index}>
                                {headerGroup.headers.map((header,index) => (
                                    <StyledTableCell key={index}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </StyledTableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableHead>
                    <TableBody>
                        {getRowModel().rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row,index) => (
                            <StyledTableRow key={index}>
                                {row.getVisibleCells().map((cell,index) => (
                                    <TableCell key={index}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
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
