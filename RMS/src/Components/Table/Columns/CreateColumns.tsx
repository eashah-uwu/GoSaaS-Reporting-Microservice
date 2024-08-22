import { ColumnDef } from "@tanstack/react-table";
import StatusSelect from "./StatusComponent/StatusSelect";
import { Link } from "react-router-dom";
import { IconButton } from "@mui/material";
import Edit from "@mui/icons-material/Edit";
import DeleteIcon from '@mui/icons-material/Delete';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../State/store";


export const setColumns = (baseColumns: { accessorKey: string; header: string }[], includeStatus: boolean, includeEdit: boolean, handleStatusChange: (id: string, newStatus: string) => void, rowIdAccessor: string, onEdit: (item: any) => void, handleDeleteClick: (id: string) => void) => {
    const Columns: ColumnDef<any>[] = createColumns(baseColumns, includeStatus, includeEdit, handleStatusChange, rowIdAccessor, onEdit, handleDeleteClick);
    return Columns;
};

const createColumns = (baseColumns: { accessorKey: string; header: string; }[], includeStatus: boolean, includeEdit: boolean, handleStatusChange: (id: string, newStatus: string) => void, rowIdAccessor: string, onEdit: (item: any) => void, handleDeleteClick: (id: string) => void): ColumnDef<any>[] => {
    const token = useSelector((state: RootState) => state.auth.token);
    const columns: ColumnDef<any>[] = baseColumns.map((col) => ({
        accessorKey: col.accessorKey,
        header: col.header,
        cell: (info: any) => {
            if (col.accessorKey === 'name' && rowIdAccessor === "applicationid") {
                return (
                    <Link style={{ color: "#bc1a1a", fontWeight: "bold", textDecoration: "none" }} to={`/application/${info.row.original[rowIdAccessor]}`}>
                        {info.getValue()}
                    </Link>
                );
            }

            if (col.accessorKey === 'filekey' && rowIdAccessor === "reportid") {
                const filekey = info.getValue();
                const fileName = filekey.split('/').pop()?.split('-').pop();
                const handleDownload = async (e: any) => {
                    e.preventDefault();
                    try {
                        const response = await axios.get(
                            `${import.meta.env.VITE_BACKEND_URL}/api/reports/download/${info.row.original[rowIdAccessor]}`,
                            {
                                responseType: "blob",
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        // Create a URL for the downloaded file
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement("a");
                        link.href = url;
                        link.setAttribute("download", fileName || "downloaded_file.xsl");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } catch (error) {
                        console.error("Error downloading file", error);
                    }
                };

                return (
                    <a style={{ color: "#bc1a1a", fontWeight: "bold", textDecoration: "none", display: "flex", justifyContent: "center" }} href={`${import.meta.env.VITE_BACKEND_URL}/api/reports/download/${info.row.original[rowIdAccessor]}`} download onClick={handleDownload}>
                        {`${fileName}  `}
                        <CloudDownloadIcon sx={{ marginLeft: "0.5rem", marginTop: "-0.2rem" }}>
                        </CloudDownloadIcon>
                    </a>
                );
            }
            // if (col.accessorKey === 'status' && rowIdAccessor === "reportstatushistoryid") {
            //     const status = info.getValue();
            //     const handleDownload = async (e: any) => {
            //         e.preventDefault();
            //         try {
            //             const response = await axios.get(
            //                 `${import.meta.env.VITE_BACKEND_URL}/api/reports/download/${info.row.original[rowIdAccessor]}`,
            //                 {
            //                     responseType: "blob",
            //                     headers: {
            //                         Authorization: `Bearer ${token}`,
            //                     },
            //                 }
            //             );

            //             // Create a URL for the downloaded file
            //             const url = window.URL.createObjectURL(new Blob([response.data]));
            //             const link = document.createElement("a");
            //             link.href = url;
            //             link.setAttribute("download", fileName || "downloaded_file.xsl");
            //             document.body.appendChild(link);
            //             link.click();
            //             document.body.removeChild(link);
            //         } catch (error) {
            //             console.error("Error downloading file", error);
            //         }
            //     };

            //     return (
            //         <a style={{ color: "#bc1a1a", fontWeight: "bold", textDecoration: "none", display: "flex", justifyContent: "center" }} href={`${import.meta.env.VITE_BACKEND_URL}/api/reports/download/${info.row.original[rowIdAccessor]}`} download onClick={handleDownload}>
            //             {`${fileName}  `}
            //             <CloudDownloadIcon sx={{ marginLeft: "0.5rem", marginTop: "-0.2rem" }}>
            //             </CloudDownloadIcon>
            //         </a>
            //     );
            // }

            return info.getValue();
        }
    }));
    if (includeStatus) {
        columns.push({
            accessorKey: 'status',
            header: 'Status',
            cell: (info: any) => <StatusSelect value={info.getValue()} rowId={info.row.original[rowIdAccessor]} handleStatusChange={handleStatusChange} />,
        });
    }
    if (rowIdAccessor != "reportstatushistoryid") {

        columns.push({
            accessorKey: "edit",
            header: "Actions",
            cell: ({ row }: any) => (
                <span style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "-0.5rem" }}>
                    {includeEdit && <IconButton onClick={() => onEdit(row.original)} sx={{ ml: 2, width: "auto", height: "auto" }}>
                        <Edit />
                    </IconButton>}

                    <DeleteIcon
                        sx={{ color: "#7d0e0e", cursor: "pointer" }}
                        onClick={() => handleDeleteClick(row.original[rowIdAccessor])} />
                </span>
            ),
        });
    }

    return columns;
};

export default setColumns;
