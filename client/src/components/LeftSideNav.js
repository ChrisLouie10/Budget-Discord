import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LeftSideNav.css';

export default function LeftSideNav(){
    return (
        <div className="wrapper">
            <nav id="sidebar">
                <div className="sidebar-header">
                    <h5>Budget-Discord</h5>
                </div>

                <ul className="list-unstyled components">
                    <li>
                        <Link to="/">Dashboard</Link>
                    </li>
                    <li>
                        <Link to="/update-profile">Update Profile</Link>
                    </li>
                    <li>
                        <Link to="/chat">Chat Room 1</Link>
                    </li>
                    <li>
                        <Link to="/chat">Chat Room 2</Link>
                    </li>
                    <li>
                        <Link to="/chat">Chat Room 3</Link>
                    </li>
                    <li>
                        <Link to="/chat">Chat Room 4</Link>
                    </li>
                </ul>
            </nav>

            <div id="content">

            </div>
        </div>
    );
};