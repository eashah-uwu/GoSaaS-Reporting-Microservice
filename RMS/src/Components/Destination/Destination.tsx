import React, { useEffect, useState } from "react";
import classes from "./Destination.module.css";
import axios from "axios";
import TableConfig from "../TableConfig/TableConfig";
import Filter from "../Filter/Filter";
import { TextField, Button, Box, Pagination, FormControl } from "@mui/material";
import AddDestination from "../AddDestination/AddDestination";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";

interface DestinationProps {
  applicationId: string;
}

const Destination: React.FC<DestinationProps> = ({ applicationId }) => {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [openAddDestination, setOpenAddDestination] = useState<boolean>(false);
  const [editingDestination, setEditingDestination] = useState<any>(null);
  const token = useSelector((state: RootState) => state.auth.token);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<{
    sortField?: string;
    sortOrder?: string;
    status?: string;
  }>({});

  const fetchDestinations = async (
    page = 1,
    pageSize = 10,
    query = "",
    filters = {}
  ) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/destinations/${applicationId}`,
        {
          params: { page, pageSize, query, filters },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const processedData = data.data.map((app: any) => ({
        ...app,
        status: app.isactive ? "active" : "inactive",
      }));

      setDestinations(processedData);
      setTotal(data.total);
    } catch (err) {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations(page, pageSize, searchQuery, filters);
  }, [applicationId, page, pageSize, filters]);

  const handleSave = async (updatedItems: any[]) => {
    try {
      const requests = updatedItems.map((item) => {
        const { destinationid, alias, url, apikey, isactive, isdeleted } = item;
        return axios.put(
          `${import.meta.env.VITE_BACKEND_URL
          }/api/destinations/${destinationid}`,
          {
            destinationid,
            alias,
            url,
            apikey,
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
      toast.success("Updated Destinations");
    } catch (error) {
      toast.error("Failed to Update Destinations");
    }
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    fetchDestinations(1, pageSize, searchQuery, filters);
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
  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if(Number(event.target.value)!=0){
      setItemsPerPage(Number(event.target.value));
      console.log(event.target.value)
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleAddDestinationOpen = () => {
    setOpenAddDestination(true);
  };

  const onClose = () => {
    setEditingDestination(null);
    setOpenAddDestination(false);
  };


  const handleAddOrEditDestination = () => {
    setEditingDestination(null);
    fetchDestinations(page, pageSize, searchQuery, filters);
  };

  const handleEdit = (destination: any) => {
    setEditingDestination(destination);
    setOpenAddDestination(true);
  };

  const handleDestinationsDelete = async (selectedIds: string[]) => {
    try {
      if (selectedIds.length == 1) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/destinations/${selectedIds[0]}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            }
          }
        );
        toast.success("Successfully Deleted Destination")
      }
      else if (selectedIds.length > 1) {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_URL}/api/destinations/delete`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            data: {
              ids: selectedIds,
            },
          }
        );
        toast.success("Successfully Deleted Destinations")
      }
      fetchDestinations(page, pageSize, searchQuery, filters);
    } catch (e) {
      toast.error("Error Deleting Destinations")
      throw e;
    }
  };
  const handleGroupStatusChange = async (selectedIds: string[], status: string) => {
    try {
      const data = { ids: selectedIds, status: status };
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/destinations/group-status`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Successfully Updated Status of Destinations")
      fetchDestinations(page, pageSize, searchQuery, filters);
    } catch (e) {
      toast.error("Error Updating Status")
      throw e;
    }
  };
  const generateBaseColumns = (data: any[]) => {
    if (data.length === 0) return [];
    const sample = data[0];
    return Object.keys(sample)
      .filter(
        (key) =>
          key !== "destinationid" &&
          key !== "applicationid" &&
          key !== "isactive" &&
          key !== "isdeleted" &&
          key !== "status"
      )
      .map((key) => ({
        accessorKey: key,
        header: key.charAt(0).toUpperCase() + key.slice(1),
      }));
  };

  const baseColumns = generateBaseColumns(destinations);

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
            data={destinations}
            includeStatus={true}
            includeEdit={true}
            baseColumns={baseColumns}
            pageSize={pageSize}
            onSave={handleSave}
            rowIdAccessor="destinationid"
            onDelete={handleDestinationsDelete}
            onGroupStatusChange={handleGroupStatusChange}
            onAddData={handleAddDestinationOpen}
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
                value={itemsPerPage < total ? itemsPerPage : total}
                onKeyDown={(event: any) => {
                  if (event.key === 'Enter') {
                    handlePageSizeChange(event);
                  }
                }}
                onChange={handleItemsPerPageChange}
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
      <AddDestination
        open={openAddDestination}
        onClose={onClose}
        onAddOrEdit={handleAddOrEditDestination}
        applicationId={applicationId}
        initialData={editingDestination}
      />
    </>
  );
};

export default Destination;
