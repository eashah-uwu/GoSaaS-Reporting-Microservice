import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem } from "@mui/material";
import axios from "axios";
import styles from "./AddSource.module.css";
import {FC } from "react";

interface AddSourceProps {
    open: boolean;
    onClose: () => void;
    onAdd: (newApplication: any) => void;
}

const AddSource: FC<AddSourceProps> = ({ open, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        database: '',
        type: '',
        host: '',
        port: '',
        alias: ''
    });

    const handleChange = (e:any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const userid = 4;
        const data = { ...formData};
        console.log(data)
        // try {
        //     const response = await axios.post(`http://localhost:3000/api/applications`, data);
        //     if (response.status === 201) {
        //         const createdApplication = response.data.application;
        //         const { applicationid, name, createdat, isactive, isdeleted, status } = createdApplication;
        //         onAdd({
        //             applicationid, name, createdat, isactive, isdeleted, status
        //         });
        //         onClose();
        //     } else {
        //         console.error('Failed to submit data');
        //     }
        // } catch (error) {
        //     console.error('Error submitting data:', error);
        // }
    };
    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>Source Connection</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.formContainer}>
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="username"
                                    name="username"
                                    label="Username"
                                    type="text"
                                    fullWidth
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="password"
                                    name="password"
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className={styles.formContainer}>
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="database"
                                    name="database"
                                    label="Database"
                                    type="text"
                                    fullWidth
                                    value={formData.database}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="type"
                                    name="type"
                                    label="Type"
                                    select
                                    fullWidth
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    <MenuItem value="">Select Type</MenuItem>
                                    <MenuItem value="type1">Type 1</MenuItem>
                                    <MenuItem value="type2">Type 2</MenuItem>
                                </TextField>
                            </div>
                        </div>
                        <div className={styles.formContainer}>
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="host"
                                    name="host"
                                    label="Host"
                                    type="text"
                                    fullWidth
                                    value={formData.host}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="port"
                                    name="port"
                                    label="Port"
                                    type="text"
                                    fullWidth
                                    value={formData.port}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className={styles.formContainer}>
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="alias"
                                    name="alias"
                                    label="Alias"
                                    type="text"
                                    fullWidth
                                    value={formData.alias}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <DialogActions>
                        <Button onClick={onClose} color="primary">
                            Cancel
                        </Button>
                        <Button type="submit" color="primary">
                            Save
                        </Button>
                    </DialogActions>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )

}

export default AddSource;