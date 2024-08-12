import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem } from "@mui/material";
import axios from "axios";
import styles from "./AddDestination.module.css";
import { FC } from "react";

interface AddDestinationProps {
    open: boolean;
    onClose: () => void;
    onAdd: (newApplication: any) => void;
}

const AddDestination: FC<AddDestinationProps> = ({ open, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        alias: '',
        destination: '',
        url: '',
        apiKey: '',
        file: "",
        bucketName: '',
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e: any) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };
    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        const userid = 4;
        const data = { ...formData };
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


    const handleUpload = async (e: any) => {
        e.preventDefault();
        const form = new FormData();
        form.append('file', formData.file);
        form.append('destination', formData.destination);
        form.append('bucketName', formData.bucketName);
        form.append('apiKey', formData.apiKey);

        try {
            const response = await axios.post('http://localhost:3000/api/destinations/upload', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data.message);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };
    const handleConnect = async () => {
        try {
            const response = await axios.post('http://localhost:3000/api/destinations/connect', formData);
            alert(response.data.message);
        } catch (error) {
            console.error('Error connecting to destination:', error);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>Destination</DialogTitle>
                <DialogContent>
                    <form onSubmit={handleSubmit}>
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
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="destination"
                                    name="destination"
                                    label="Destination"
                                    type="text"
                                    fullWidth
                                    value={formData.destination}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className={styles.formContainer}>
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="url"
                                    name="url"
                                    label="URL"
                                    type="text"
                                    fullWidth
                                    value={formData.url}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={styles.formItem}>
                                <TextField
                                    margin="dense"
                                    id="apiKey"
                                    name="apiKey"
                                    label="API Key"
                                    type="text"
                                    fullWidth
                                    value={formData.apiKey}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <TextField
                            margin="dense"
                            id="bucketName"
                            name="bucketName"
                            label="Bucket/Container Name"
                            type="text"
                            fullWidth
                            value={formData.bucketName}
                            onChange={handleChange}
                        />
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                        />
                        <DialogActions className={styles.formActions}>
                            <Button onClick={handleConnect} type="button" color="primary" className={styles.connectButton}>
                                Connect Destination
                            </Button>
                            <Button onClick={onClose} color="primary" className={styles.closeButton}>
                                Cancel
                            </Button>
                            <Button onClick={handleUpload} color="primary">
                                Upload File
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

export default AddDestination;