import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button } from '@mui/material';
import Navbar from '../Components/Navbar';
import Table from '../Components/Table/Table';
import { setColumns } from '../Components/Table/Columns/CreateColumns';
import classes from "./pages.module.css"
import Confirmation from "../Components/ConfirmationDialogue/Confirmation"
const baseColumns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'gender', header: 'Gender' },
];

const DATA = [
    { id: "1", name: "a", email: "abc@gmail.com", gender: "male", status: "delete" },
    { id: "2", name: "b", email: "abc@gmail.com", gender: "male", status: "active" },
    { id: "3", name: "c", email: "abc@gmail.com", gender: "male", status: "active" },
    { id: "4", name: "d", email: "abc@gmail.com", gender: "male", status: "inactive" },
    { id: "5", name: "e", email: "abc@gmail.com", gender: "male", status: "active" },
    { id: "6", name: "f", email: "abc@gmail.com", gender: "male", status: "active" },
    { id: "7", name: "g", email: "abc@gmail.com", gender: "male", status: "active" },
    { id: "8", name: "h", email: "abc@gmail.com", gender: "male", status: "active" },
    { id: "9", name: "i", email: "abc@gmail.com", gender: "male", status: "active" },
]
const ApplicationPage = () => {
    const [users, setUsers] = useState<any[]>(DATA);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('https://gorest.co.in/public/v2/users');
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(false);
        // fetchUsers();
    }, []);

    const handleStatusChange = (id: string, newStatus: string) => {
        if (newStatus === 'delete') {
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
                user.id === selectedUserId ? { ...user, status: 'delete' } : user
            )
        );
        setOpenDialog(false);
        setSelectedUserId(null);
    };

    const handleDeleteCancel = () => {
        setOpenDialog(false);
        setSelectedUserId(null);
    };

    const includeStatus = true; 
    const Columns = setColumns(baseColumns, includeStatus, handleStatusChange);
    const filteredUsers = users.filter(user => user.status !== 'delete');
    const handleSave = async () => {
        try {
           console.log(users)
            alert('Data successfully updated');
        } catch (error) {
            alert('Failed to update data');
        }
    };

    return (
        <>
            <Navbar />
            <Box padding={6}>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                {filteredUsers && <Table data={filteredUsers} columns={Columns}/>}
                <span className={classes.save_button_span}>
                    <Button variant="contained" color="success" size="small" onClick={handleSave}>
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

export default ApplicationPage;
