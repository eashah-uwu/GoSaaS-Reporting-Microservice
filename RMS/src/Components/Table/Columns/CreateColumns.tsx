import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import StatusSelect from "./StatusComponent/StatusSelect";

export const setColumns = (baseColumns: { accessorKey: string; header: string }[], includeStatus: boolean) => {
  const Columns: ColumnDef<any>[] = createColumns(baseColumns, includeStatus);
  return Columns;
};

const createColumns = (baseColumns: { accessorKey: string; header: string }[], includeStatus: boolean): ColumnDef<any>[] => {
  const columns: ColumnDef<any>[] = baseColumns.map((col) => ({
    accessorKey: col.accessorKey,
    header: col.header,
  }));

  if (includeStatus) {
    columns.push({
      accessorKey: 'status',
      header: 'Status',
      cell: (info:any) => <StatusSelect value={info.getValue()} />,
    });
  }

  return columns;
};

export default setColumns;
