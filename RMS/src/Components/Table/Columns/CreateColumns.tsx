import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import StatusSelect from "./StatusComponent/StatusSelect";
import classes from "./Columns.module.css";

export const setColumns = (baseColumns: { accessorKey: string; header: string }[], includeStatus: boolean, handleStatusChange: (id: string, newStatus: string) => void) => {
  const Columns: ColumnDef<any>[] = createColumns(baseColumns, includeStatus, handleStatusChange);
  return Columns;
};

const createColumns = (baseColumns: { accessorKey: string; header: string }[], includeStatus: boolean, handleStatusChange: (id: string, newStatus: string) => void): ColumnDef<any>[] => {
  const columns: ColumnDef<any>[] = baseColumns.map((col) => ({
    accessorKey: col.accessorKey,
    header: col.header,
  }));

  if (includeStatus) {
    columns.push({
      accessorKey: 'status',
      header: 'Status',
      cell: (info: any) => <StatusSelect value={info.getValue()} rowId={info.row.original.id} handleStatusChange={handleStatusChange} />,
    });
  }

  return columns;
};

export default setColumns;