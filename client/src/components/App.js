import React from 'react';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Signup from "./auth/Signup"
import Dashboard from "./auth/Dashboard";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import UpdateProfile from "./auth/UpdateProfile";
import CheckingUser from './auth/CheckingUser';
import Chat from './chat/Chat';
import Navbar from './Navbar';
import LeftSideNav from './LeftSideNav.js';

export default function App() {
  /*
    To create a path, create a Route/PrivateRoute Component.
    Route/PrivateRoute attributes
      path (required): string containing the path of the page
      component (required): component to be rendered
      exact: path must be exactly the same as the path
              prevents overriding of pages ex. goes to "/" instead of "/login" without exact
              
    PrivateRoute is for pages that require users to be logged in
  */

  return (
    <div>
      <Container className="d-flex align-items-center justify-content-center"
        style={{minHeight: "100vh"}}>
        <div className="w-100" style={{maxWidth: "400px"}}>
          <Router>
            <Navbar/>
            <LeftSideNav/>
              <Switch>
                <PrivateRoute exact path="/" component={Dashboard} />
                <PrivateRoute exact path="/update-profile" component={UpdateProfile} />
                <PrivateRoute path="/checking-user" component={CheckingUser} />
                <Route exact path="/chat/:serverId" component={Chat} />
                <Route path="/signup" component={Signup} />
                <Route path="/login" component={Login} />
              </Switch>
          </Router>
        </div>
      </Container>
      </div>
  );
}
