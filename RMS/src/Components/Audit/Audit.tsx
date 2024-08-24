import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../State/store";
import TableConfig from "../TableConfig/TableConfig";
import { Box, CircularProgress, Pagination, TextField } from "@mui/material";

interface AuditProps {
  filters: any;
}

const Audit: React.FC<AuditProps> = ({ filters }) => {
  const token = useSelector((state: RootState) => state.auth.token);

  const [auditData, setAuditData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);

  const fetchAuditData = async (page = 1, pageSize = 10, filters = {}) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/audit-trails`,
        {
          params: { page, pageSize, ...filters },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAuditData(data);
      setTotal(data.length);
    } catch (error) {
      console.error("Error fetching audit data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData(page, pageSize, filters);
  }, [page, pageSize, filters]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  return (
    <Box sx={{ marginTop: "2rem", marginLeft: "10%", marginRight: "10%" }}>
      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableConfig
            data={auditData}
            includeStatus={false}
            baseColumns={[{
              field: 'createdby',
              headerName: 'Created By',
              flex: 1,
            }, {
              field: 'description',
              headerName: 'Description',
              flex: 1,
            }, {
              field: 'Module-Event',
              headerName: 'Module-Event',
              flex: 1,
            }, {
              field: 'createddate',
              headerName: 'Created Date',
              flex: 1,
            }]} 
            pageSize={pageSize}
            onSave={() => {}}
            onDelete={() => {}}
            rowIdAccessor="id"
            includeEdit={false}
            onAddData={() => {}}
            onEdit={() => {}}
            onGroupStatusChange={() => {}}
          />
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, marginTop: 2 }}>
            <Pagination count={Math.ceil(total / pageSize)} page={page} onChange={handlePageChange} />
            <TextField
              label="Items per page"
              value={pageSize}
              onChange={handlePageSizeChange}
              variant="standard"
              type="number"
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ maxWidth: "6rem", "& input": { textAlign: "center" } }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default Audit;
