import React, { useEffect, useState } from "react";
import classes from "./Source.module.css";
import axios from "axios";
import TableConfig from "../TableConfig/TableConfig";
import Filter from "../Filter/Filter";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import { TextField, Button, Box, Pagination, FormControl } from "@mui/material";
import AddSource from "../AddSource/AddSource";
import { toast } from "react-toastify";
interface SourceProps {
  applicationId: string;
}

const Source: React.FC<SourceProps> = ({ applicationId }) => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openAddSource, setOpenAddSource] = useState<boolean>(false);
  const [editingSource, setEditingSource] = useState<any>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<{
    sortField?: string;
    sortOrder?: string;
    status?: string;
  }>({});

  const fetchConnections = async (
    page = 1,
    pageSize = 10,
    query = "",
    filters = {}
  ) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/connections/${applicationId}`,
        {
          params: { page, pageSize, query, filters },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const processedData = data.data.map((app: any) => ({
        ...app,
        status: app.isdeleted ? "delete" : app.isactive ? "active" : "inactive",
      }));

      setConnections(processedData);
      setTotal(data.total);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections(page, pageSize, searchQuery, filters);
  }, [applicationId, page, pageSize, filters]);

  const handleSave = async (updatedItems: any[]) => {
    try {
      const requests = updatedItems.map((item) => {
        const { connectionid, isactive, isdeleted } = item;
        return axios.put(
          `${import.meta.env.VITE_BACKEND_URL}/api/connections/${connectionid}`,
          {
            connectionid,
            isactive,
            isdeleted,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      });
      await Promise.all(requests);
      toast.success("Updated Status");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    fetchConnections(1, pageSize, searchQuery, filters);
  };

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(Number(event.target.value)!=0){
      setPageSize(Number(event.target.value));
      setPage(1);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };
  const handleAddSourceOpen = () => {
    setEditingSource(null);
    setOpenAddSource(true);
  };

  const handleAddApplicationClose = () => {
    setEditingSource(null);
    setOpenAddSource(false);
  };

  const handleAddSource = () => {
    fetchConnections(page, pageSize, searchQuery, filters);
  };

  const handleUpdateSource = (updatedSource: any) => {
    setConnections((prevData) =>
      prevData.map((source) =>
        source.connectionid === updatedSource.connectionid
          ? {
              ...updatedSource,
              status: updatedSource.isactive ? "active" : "inactive",
            }
          : source
      )
    );
  };

  const handleEdit = (connection: any) => {
    setEditingSource(connection);
    setOpenAddSource(true);
  };

  const handleConnectionDelete = async (connectionId: string | null) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/connections/${connectionId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Connection Deleted Successfully");
      fetchConnections(page, pageSize, searchQuery, filters);
    } catch (e) {
      throw e;
      toast.error("Connection Deletion Failed");
    }
  };

  const generateBaseColumns = (data: any[]) => {
    if (data.length === 0) return [];

    const sample = data[0];
    const columns = Object.keys(sample)
      .filter(
        (key) =>
          key !== "connectionid" &&
          key !== "applicationid" &&
          key !== "isactive" &&
          key !== "isdeleted" &&
          key !== "username" &&
          key !== "status"
      )
      .map((key) => ({
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1),
      }));

    return columns;
  };

  const baseColumns = generateBaseColumns(connections);

  return (
    <>
      <div className={classes.main}>
        <Box sx={{ float: "left", marginLeft: "7.5%" }}>
          <Filter
            columns={baseColumns}
            onFilterChange={handleFilterChange}
            showStatusFilter={true}
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
            data={connections}
            includeStatus={true}
            includeEdit={true}
            baseColumns={baseColumns}
            pageSize={pageSize}
            onSave={handleSave}
            rowIdAccessor="connectionid"
            onDelete={handleConnectionDelete}
            onAddData={handleAddSourceOpen}
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
      </div>
      <AddSource
        applicationId={applicationId}
        open={openAddSource}
        onClose={handleAddApplicationClose}
        onAdd={handleAddSource}
        onEdit={handleUpdateSource}
        sourceToEdit={editingSource}
      />
    </>
  );
};

export default Source;
