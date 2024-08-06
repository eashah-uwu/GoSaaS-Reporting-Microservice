import React from "react";
import TableConfig from "../Components/TableConfig/TableConfig";
import Navbar from "../Components/Navbar/Navbar";
import classes from "./pages.module.css";

const ApplicationPage = () => {
  return (
    <>
      <Navbar />
      <TableConfig />
    </>
  );
};

export default ApplicationPage;
