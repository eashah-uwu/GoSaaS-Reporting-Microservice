import { ColumnDef } from "@tanstack/react-table";
import StatusSelect from "./StatusComponent/StatusSelect";
import { Link } from "react-router-dom";

export const setColumns = (baseColumns: { accessorKey: string; header: string }[], includeStatus: boolean, handleStatusChange: (id: string, newStatus: string) => void) => {
    const Columns: ColumnDef<any>[] = createColumns(baseColumns, includeStatus, handleStatusChange);
    return Columns;
};

const createColumns = (baseColumns: { accessorKey: string; header: string }[], includeStatus: boolean, handleStatusChange: (id: string, newStatus: string) => void): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = baseColumns.map((col) => ({
        accessorKey: col.accessorKey,
        header: col.header,
        cell: (info: any) => (
            col.accessorKey === 'name' ? (
                <Link to={`/application/${info.row.original.applicationid}`}>
                    {info.getValue()}
                </Link>
            ) : info.getValue()
        )
    }));

    if (includeStatus) {
        columns.push({
            accessorKey: 'status',
            header: 'Status',
            cell: (info: any) => <StatusSelect value={info.getValue()} rowId={info.row.original.applicationid} handleStatusChange={handleStatusChange} />,
        });
    }

    return columns;
};

export default setColumns;
