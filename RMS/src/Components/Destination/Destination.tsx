import classes from "./Destination.module.css"
import React, { useEffect, useState } from "react";
import axios from 'axios';

const Destination = ({ applicationId }: { applicationId: string }) => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/destinations/${applicationId}`);
        setData(response.data);
        console.log(response.data)

      } catch (error) {
        console.error("Failed to fetch source data", error);
      }
    };

    fetchData();
  }, [applicationId]);

  return (
    <div>
      <h2>Destination Data</h2>
    </div>
  );
};

export default Destination;
