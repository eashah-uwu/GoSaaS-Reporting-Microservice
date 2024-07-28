import React from "react";
import classes from "./StatusSelect.module.css";
interface StatusSelectProps {
    value: string;
}

const StatusSelect: React.FC<StatusSelectProps> = ({ value }) => {
    const [status, setStatus] = React.useState(value);

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(event.target.value);
    };

    return (
        <div className="status-select-container">
            <select value={status} onChange={handleChange} className={`${classes.status_select} ${classes[`status_${status}`]}`}>
                {status === "active" ? (
                    <>
                        <option value="active" hidden selected className={`${classes.status_active} option`}>Active</option>
                        <option value="inactive" className={`${classes.status_inactive} option`}>Inactive</option>
                    </>

                ) : status === "inactive" ? (
                    <>
                        <option value="inactive" hidden selected className={`${classes.status_inactive} option`}>Inactive</option>
                        <option value="active"  className={`${classes.status_active} option`}>Active</option>
                        <option value="delete"  className={`${classes.status_delete} option`}>Delete</option>
                    </>
                ) : (
                    <>
                        <option value="inactive" className={`${classes.status_inactive} option`}>Inactive</option>
                        <option value="active" className={`${classes.status_active} option`}>Active</option>
                        <option value="delete" hidden selected className={`${classes.status_delete} option`}>Delete</option>
                    </>
                )}
            </select>
            <span className="dropdown-icon">&#9662;</span>
        </div>
    );
};

export default StatusSelect;
