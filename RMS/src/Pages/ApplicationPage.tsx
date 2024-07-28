import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box } from '@mui/material';
import Navbar from '../Components/Navbar';
import Table from '../Components/Table/Table';
import { setColumns } from '../Components/Table/Columns/CreateColumns.tsx';

const baseColumns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'gender', header: 'Gender' },
];

const DATA=[
  {id:"1",name:"abc",email:"abc@gmail.com",gender:"male",status:"active"},
  {id:"2",name:"abc",email:"abc@gmail.com",gender:"male",status:"active"},
  {id:"3",name:"abc",email:"abc@gmail.com",gender:"male",status:"active"},
  {id:"4",name:"abc",email:"abc@gmail.com",gender:"male",status:"inactive"},
  {id:"5",name:"abc",email:"abc@gmail.com",gender:"male",status:"active"},
  {id:"6",name:"abc",email:"abc@gmail.com",gender:"male",status:"active"},
  {id:"7",name:"abc",email:"abc@gmail.com",gender:"male",status:"active"},
  {id:"8",name:"abc",email:"abc@gmail.com",gender:"male",status:"active"},
  {id:"9",name:"abc",email:"abc@gmail.com",gender:"male",status:"active"},
]
const ApplicationPage = () => {
    const [users, setUsers] = useState<any[]>(DATA);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

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

    const includeStatus = true; 
    const Columns = setColumns(baseColumns, includeStatus);

    return (
        <>
            <Navbar />
            <Box padding={6}>
                {loading && <p>Loading...</p>}
                {error && <p>{error}</p>}
                {users && <Table data={users} columns={Columns} />}
            </Box>
        </>
    );
};

export default ApplicationPage;
