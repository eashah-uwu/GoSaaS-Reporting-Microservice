import React, { useEffect, useState } from "react";
import classes from "./Report.module.css";
import axios from "axios";
import TableConfig from "../TableConfig/TableConfig";
import Filter from "../Filter/Filter";
import { TextField, Button, Box, Pagination, FormControl } from "@mui/material";
import AddReport from "../AddReport/AddReport";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { RootState } from "../../State/store";

interface ReportProps {
  applicationId: string;
}

const Report: React.FC<ReportProps> = ({ applicationId }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  const [openAddReport, setOpenAddReport] = useState<boolean>(false);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<{
    sortField?: string;
    sortOrder?: string;
    status?: string;
  }>({});

  const fetchReports = async (
    page = 1,
    pageSize = 10,
    query = "",
    filters = {}
  ) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/reports/${applicationId}`,
        {
          params: { page, pageSize, query, filters },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setReports(data.data);
      setTotal(data.total);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(page, pageSize, searchQuery, filters);
  }, [applicationId, page, pageSize, filters]);

  const handleSave = async (updatedItems: any[]) => {
    try {
      // const requests = updatedItems.map((item) => {
      //   const { destinationid, alias, url, apikey, isactive, isdeleted } = item;
      //   return axios.put(
      //     `${
      //       import.meta.env.VITE_BACKEND_URL
      //     }/api/destinations/${destinationid}`,
      //     {
      //       destinationid,
      //       alias,
      //       url,
      //       apikey,
      //       isactive,
      //       isdeleted,
      //     }
      //   );
      // });
      // await Promise.all(requests);
      // console.log("Updated Items", updatedItems);
    } catch (error) {
      alert("Failed to update data");
    }
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    fetchReports(1, pageSize, searchQuery, filters);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(event.target.value) != 0) {
      setPageSize(Number(event.target.value));
      setPage(1);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleAddReportOpen = () => {
    setOpenAddReport(true);
  };

  const handleAddReportClose = () => {
    setOpenAddReport(false);
  };
  const handleAddReport = () => {
    fetchReports(page, pageSize, searchQuery, filters);
  };

  const handleReportDelete = async (selectedIds: string[]) => {
    try {
      if(selectedIds.length==1){
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/reports/${selectedIds[0]}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
        toast.success("Successfully Deleted Reports")
      }
      else if(selectedIds.length>1){
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/reports/delete`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: {
              ids: selectedIds,
            },
          }
        );
        toast.success("Successfully Deleted Reports")
      }
      fetchReports(page, pageSize, searchQuery, filters);
      } catch (e) {
        toast.error("Error Deleting Reports")
        throw e;
      }
  };
  const handleEdit = (connection: any) => {};
  const generateBaseColumns = (data: any[]) => {
    if (data.length === 0) return [];
    const sample = data[0];
    return Object.keys(sample)
      .filter(
        (key) =>
          key !== "destinationid" &&
          key !== "applicationid" &&
          key !== "sourceconnectionid" &&
          key !== "storedprocedureid" &&
          key !== "status" &&
          key !== "reportid" &&
          key !== "description"
      )
      .map((key) =>
        key === "filekey"
          ? { accessorKey: key, header: "Xsl File" }
          : {
              accessorKey: key,
              header: key.charAt(0).toUpperCase() + key.slice(1),
            }
      );
  };

  const baseColumns = generateBaseColumns(reports);

  return (
    <>
      <div className={classes.main}>
        <Box sx={{ float: "left", marginLeft: "7.5%" }}>
          <Filter
            columns={baseColumns}
            onFilterChange={handleFilterChange}
            showStatusFilter={false}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            marginBottom: 2,
            marginRight: "7.5rem",
          }}
        >
          <TextField
            label="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
          />
          <Button
            onClick={handleSearchSubmit}
            size="medium"
            sx={{
              backgroundColor: "#7d0e0e",
              color: "white",
              ":hover": { backgroundColor: "#7d0e0e", color: "white" },
            }}
          >
            Search
          </Button>
        </Box>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {!loading && !error && (
          <TableConfig
            data={reports}
            includeStatus={false}
            includeEdit={true}
            baseColumns={baseColumns}
            pageSize={pageSize}
            onSave={handleSave}
            rowIdAccessor="reportid"
            onDelete={handleReportDelete}
            onAddData={handleAddReportOpen}
            onEdit={handleEdit}
          />
        )}
        {!loading && !error && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 2,
              marginBottom: 2,
            }}
          >
            <Pagination
              sx={{ marginTop: "0.8rem" }}
              count={Math.ceil(total / pageSize)}
              page={page}
              onChange={handlePageChange}
            />
            <FormControl
              sx={{
                display: "flex",
                justifyContent: "space-evenly",
                alignItems: "end",
                flexDirection: "row",
                minWidth: 120,
              }}
              variant="outlined"
              size="small"
            >
              <TextField
                label="Items per page"
                value={pageSize < total ? pageSize : total}
                onChange={handlePageSizeChange}
                variant="standard"
                type="number"
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ maxWidth: "6rem", "& input": { textAlign: "center" } }}
              />
              <Box sx={{ paddingBottom: "0.5rem", color: "black" }}>
                out of {total} items
              </Box>
            </FormControl>
          </Box>
        )}
        {/* <a href={`${import.meta.env.VITE_BACKEND_URL}/api/reports/download/11`} download>
          <button>Download File</button>
        </a> */}
      </div>
      <AddReport
        open={openAddReport}
        applicationId={applicationId}
        onClose={handleAddReportClose}
        onAdd={handleAddReport}
      />
    </>
  );
};

export default Report;
