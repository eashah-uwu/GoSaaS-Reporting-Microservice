import { ColumnDef } from "@tanstack/react-table";
import StatusSelect from "./StatusComponent/StatusSelect";
import { Link } from "react-router-dom";
import { IconButton } from "@mui/material";
import Edit from "@mui/icons-material/Edit";
export const setColumns = (
  baseColumns: { accessorKey: string; header: string }[],
  includeStatus: boolean,
  includeEdit : boolean,
  handleStatusChange: (id: string, newStatus: string) => void,
  rowIdAccessor: string,
  onEdit: (item: any) => void
) => {
  const Columns: ColumnDef<any>[] = createColumns(
    baseColumns,
    includeStatus,
    includeEdit,
    handleStatusChange,
    rowIdAccessor,
    onEdit
  );
  return Columns;
};

const createColumns = (
baseColumns: { accessorKey: string; header: string; }[], includeStatus: boolean, includeEdit: boolean, handleStatusChange: (id: string, newStatus: string) => void, rowIdAccessor: string, onEdit: (item: any) => void): ColumnDef<any>[] => {
  const columns: ColumnDef<any>[] = baseColumns.map((col) => ({
    accessorKey: col.accessorKey,
    header: col.header,
    cell: (info: any) =>
      col.accessorKey === "name" ? (
        <Link to={`/application/${info.row.original[rowIdAccessor]}`}>
          {info.getValue()}
        </Link>
      ) : (
        info.getValue()
      ),
  }));
  if (includeStatus) {
    columns.push({
      accessorKey: "status",
      header: "Status",
      cell: (info: any) => (
        <StatusSelect
          value={info.getValue()}
          rowId={info.row.original[rowIdAccessor]}
          handleStatusChange={handleStatusChange}
        />
      ),
    });
    if (includeEdit) {
      columns.push({
        accessorKey: "edit",
        header: "Edit",
        cell: ({ row }: any) => (
            <IconButton  onClick={() => onEdit(row.original)} sx={{ ml: 2, width: "auto", height: "auto" }}>
              <Edit />
        </IconButton>
        ),
      });
    }
  }

  return columns;
};

export default setColumns;
