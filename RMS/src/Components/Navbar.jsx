import React from 'react';
import { Link } from "react-router-dom";

function Navbar() {

    return (
        <div className="nav">
            <ul >
                <li><Link className="li" to="/">Dashboard</Link></li>
                <li><Link className="li" to="/login">Login</Link> </li>
            </ul>
        </div>
    );
}

export default Navbar;