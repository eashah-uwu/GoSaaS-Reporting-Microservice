import { ColumnDef } from "@tanstack/react-table";
import StatusSelect from "./StatusComponent/StatusSelect";
import { Link } from "react-router-dom";

export const setColumns = (baseColumns: { accessorKey: string; header: string }[], includeStatus: boolean, handleStatusChange: (id: string, newStatus: string) => void,rowIdAccessor: string) => {
    const Columns: ColumnDef<any>[] = createColumns(baseColumns, includeStatus, handleStatusChange,rowIdAccessor);
    return Columns;
};

const createColumns = (baseColumns: { accessorKey: string; header: string; }[], includeStatus: boolean, handleStatusChange: (id: string, newStatus: string) => void,rowIdAccessor: string): ColumnDef<any>[] => {
    const columns: ColumnDef<any>[] = baseColumns.map((col) => ({
        accessorKey: col.accessorKey,
        header: col.header,
        cell: (info: any) => (
            col.accessorKey === 'name' ? (
                <Link to={`/application/${info.row.original[rowIdAccessor]}`}>
                    {info.getValue()}
                </Link>
            ) : info.getValue()
        )
    }));
    if (includeStatus) {
        columns.push({
            accessorKey: 'status',
            header: 'Status',
            cell: (info: any) => <StatusSelect value={info.getValue()} rowId={info.row.original[rowIdAccessor]} handleStatusChange={handleStatusChange} />,
        });
    }

    return columns;
};

export default setColumns;
