import React, { useState } from "react";
import { Link } from "react-router-dom";
const jwt = require('jsonwebtoken');

export default function ServerList(){

    const [user, setUser] = useState(jwt.verify(localStorage.getItem('access-token'), process.env.REACT_APP_SECRET_ACCESS_TOKEN));
    
}