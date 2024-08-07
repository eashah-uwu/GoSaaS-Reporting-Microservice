import React, { useEffect, useState } from "react";
import classes from "./Source.module.css"
import axios from 'axios';
import TableConfig from "../TableConfig/TableConfig";
import Filter from "../Filter/Filter";
import { TextField, Button, Box, Pagination, FormControl } from '@mui/material';
interface SourceProps {
  applicationId: string;
}

const Source: React.FC<SourceProps> = ({ applicationId }) => {
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filters, setFilters] = useState<{ sortField?: string, sortOrder?: string, status?: string }>({});

  const fetchConnections = async (page = 1, pageSize = 10, query = "", filters = {}) => {
    try {
      setLoading(true);
      const {data} = await axios.get(`http://localhost:3000/api/connections/${applicationId}`, {
        params: { page, pageSize, query, filters }
      });
      console.log(data)
      // const processedData = data.map((conn: any) => ({
      //   ...conn,
      //   status: conn.isdeleted ? "delete" : (conn.isactive ? "active" : "inactive")
      // }));
      const processedData=[{
        ...data,
        status:data.isdeleted ? "delete" : (data.isactive ? "active" : "inactive")
      }]
      setConnections(processedData);
      setTotal(data.total);
    } catch (error) {
      setError("Failed to fetch source data");
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections(page, pageSize, searchQuery, filters);
  }, [applicationId, page, pageSize, searchQuery, filters]);

  const handleSave = async (updatedItems: any[]) => {
    // try {
    //   const requests = updatedItems.map(item => {
    //     const { connectionid, alias, host, port, database, type, isactive, isdeleted } = item;
    //     return axios.put(`http://localhost:3000/api/connections/${connectionid}`, {
    //       connectionid, alias, host, port, database, type, isactive, isdeleted
    //     });
    //   });
    //   await Promise.all(requests);
    //   console.log("Updated Items", updatedItems);
    // } catch (error) {
    //   alert("Failed to update data");
    // }
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    fetchConnections(1, pageSize, searchQuery, filters);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1);
  };
  const generateBaseColumns = (data: any[]) => {
    if (data.length === 0) return [];
    const sample = data[0];
    return Object.keys(sample)
      .filter(key => key !== 'connectionid' && key!=="isactive" && key!=="isdeleted")
      .map((key) => (
          {
            accessorKey: key,
            header: key.charAt(0).toUpperCase() + key.slice(1),
          }));
  };

  const baseColumns = generateBaseColumns(connections);


  return (
<div className={classes.main}>
            <Box sx={{float:"left", marginLeft:"7.5%"}}>
            <Filter columns={baseColumns} onFilterChange={handleFilterChange} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, marginBottom: 2, marginRight:"7.5rem" }}>
                <TextField
                    label="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                />
                <Button onClick={handleSearchSubmit} variant="contained" size="medium" sx={{ ml: 1 }}>
                    Search
                </Button>
            </Box>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && <TableConfig data={connections} includeStatus={true} baseColumns={baseColumns} pageSize={pageSize} onSave={handleSave} rowIdAccessor="connectionid"/>}
            {!loading && !error &&
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: "center", gap: 2, marginBottom: 2 }}>
                    <Pagination sx={{ marginTop: "0.8rem" }} count={Math.ceil(total / pageSize)} page={page} onChange={handlePageChange} />
                    <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                        <TextField
                            label="Items per page"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            variant="standard"
                            type="number"
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{maxWidth: '6rem' , '& input': { textAlign: 'center' } }}
                        />
                    </FormControl>
                </Box>
               
            }

                

      </div>
  );
};

export default Source;
