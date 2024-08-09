import classes from "./Report.module.css";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Report = ({ applicationId }: { applicationId: string }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/reports/${applicationId}`
        );
        setData(response.data);
        console.log(response.data);
      } catch (error) {
        console.error("Failed to fetch source data", error);
      }
    };

    fetchData();
  }, [applicationId]);

  return (
    <div>
      <h2>Report Data</h2>
    </div>
  );
};

export default Report;
