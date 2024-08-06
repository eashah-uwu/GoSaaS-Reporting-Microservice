import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Button } from "@mui/material";
import Table from "../Table/Table";
import { setColumns } from "../Table/Columns/CreateColumns";
import classes from "./TableConfig.module.css";
import Confirmation from "../ConfirmationDialogue/Confirmation";
import Filter from "../Filter/Filter";
const baseColumns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "gender", header: "Gender" },
];

const DATA = [
  {
    id: "1",
    name: "a",
    email: "fads@gmail.com",
    gender: "male",
    status: "inactive",
  },
  {
    id: "2",
    name: "b",
    email: "eqwebc@gmail.com",
    gender: "male",
    status: "active",
  },
  {
    id: "3",
    name: "c",
    email: "fadsg@gmail.com",
    gender: "male",
    status: "active",
  },
  {
    id: "4",
    name: "d",
    email: "fdsac@gmail.com",
    gender: "female",
    status: "inactive",
  },
  {
    id: "5",
    name: "e",
    email: "rqw@gmail.com",
    gender: "male",
    status: "active",
  },
  {
    id: "6",
    name: "f",
    email: "adfs@gmail.com",
    gender: "male",
    status: "active",
  },
  {
    id: "7",
    name: "g",
    email: "erw@gmail.com",
    gender: "female",
    status: "active",
  },
  {
    id: "8",
    name: "h",
    email: "gsfd@gmail.com",
    gender: "male",
    status: "active",
  },
  {
    id: "9",
    name: "i",
    email: "rew@gmail.com",
    gender: "male",
    status: "active",
  },
];
const TableConfig = () => {
  const [initialUsers, setInitialUsers] = useState<any[]>(DATA);
  const [users, setUsers] = useState<any[]>(DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isSaveEnabled, setIsSaveEnabled] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    searchText: "",
    sortField: "",
    sortOrder: "asc",
  });

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get("https://gorest.co.in/public/v2/users");
      setUsers(data);
      setInitialUsers(data);
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
    // fetchUsers();
  }, []);
  useEffect(() => {
    const isChanged = JSON.stringify(initialUsers) !== JSON.stringify(users);
    console.log(isChanged);
    setIsSaveEnabled(isChanged);
  }, [users, initialUsers]);
  const handleStatusChange = (id: string, newStatus: string) => {
    if (newStatus === "delete") {
      setSelectedUserId(id);
      setOpenDialog(true);
    } else {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === id ? { ...user, status: newStatus } : user
        )
      );
    }
  };
  const handleDeleteConfirm = () => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === selectedUserId ? { ...user, status: "delete" } : user
      )
    );
    setOpenDialog(false);
    setSelectedUserId(null);
  };

  const handleDeleteCancel = () => {
    setOpenDialog(false);
    setSelectedUserId(null);
  };

  const handleFilterChange = (filters: any) => {
    setFilters(filters);
  };
  const includeStatus = true;
  const Columns = setColumns(baseColumns, includeStatus, handleStatusChange);
  const filteredUsers = users
    .filter((user) => user.status !== "delete")
    .filter((user) => {
      return Object.values(user).some(
        (value) =>
          typeof value === "string" &&
          value.toLowerCase().includes(filters.searchText.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (!filters.sortField || filters.sortField === "None") return 0;
      const aValue = a[filters.sortField];
      const bValue = b[filters.sortField];
      if (aValue < bValue) return filters.sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return filters.sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  const handleSave = async () => {
    try {
      // Send the updated data to the backend
      console.log(users);
      setInitialUsers(users);
      setIsSaveEnabled(false);
      alert("Data successfully updated");
    } catch (error) {
      alert("Failed to update data");
    }
  };

  return (
    <>
      <Box padding={6}>
        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        <Filter
          columns={
            includeStatus
              ? [...baseColumns, { accessorKey: "status", header: "Status" }]
              : baseColumns
          }
          onFilterChange={handleFilterChange}
        />
        {filteredUsers && <Table data={filteredUsers} columns={Columns} />}
        <span className={classes.save_button_span}>
          <Button
            variant="contained"
            color="success"
            size="small"
            onClick={handleSave}
            disabled={!isSaveEnabled}
          >
            Save Changes
          </Button>
        </span>
      </Box>
      <Confirmation
        open={openDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Confirm Deletion"
        message="Are you sure you want to delete this user?"
      />
    </>
  );
};

export default TableConfig;
