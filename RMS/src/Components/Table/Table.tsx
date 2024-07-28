import React, { FC, useEffect } from 'react';
import { Paper, Table as MuiTable, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

interface TableProps {
    data: any[];
    columns: ColumnDef<any>[];
}

const Table: FC<TableProps> = ({ data, columns }) => {
    const { getHeaderGroups, getRowModel } = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    useEffect(() => {
        console.log(data)
        console.log(columns)
    }, [data, columns]);

    return (
        <Paper elevation={2} style={{ padding: "1rem 0px" }}>
            <MuiTable>
                <TableHead>
                    {getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableCell key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableHead>
                <TableBody>
                    {getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </MuiTable>
        </Paper>
    );
};

export default Table;
