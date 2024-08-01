import React, { useEffect, useState } from "react";
import axios from 'axios';
import TableConfig from "../TableConfig/TableConfig";

const Dashboard = () => {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchApplications = async () => {
        try {
            const { data } = await axios.get('http://localhost:3000/api/applications');
            const processedData = data
                .map((app: any) => ({
                    ...app,
                    status:app.isDeleted?"delete":(app.isactive ? "active" : "inactive") 
                }));
            setApplications(processedData);
        } catch (err) {
            setError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);
    const generateBaseColumns = (data: any[]) => {
        if (data.length === 0) return [];
        const sample = data[0];
        return Object.keys(sample)
            .filter(key => key !== 'isactive' && key !== 'isdeleted')
            .map((key) => (
                key == "applicationid" ? { accessorKey: key, header: "ID" } :
                    {
                        accessorKey: key,
                        header: key.charAt(0).toUpperCase() + key.slice(1),
                    }));
    };

    const baseColumns = generateBaseColumns(applications);
    return (
        <>
            {loading && <p>Loading...</p>}
            {error && <p>{error}</p>}
            {!loading && !error && <TableConfig data={applications} includeStatus={true} baseColumns={baseColumns} />}
        </>
    );
}

export default Dashboard;
