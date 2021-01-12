import React from 'react';
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Signup from "./auth/Signup"
import Dashboard from "./auth/Dashboard";
import Login from "./auth/Login";
import PrivateRoute from "./auth/PrivateRoute";
import UpdateProfile from "./auth/UpdateProfile";
import CheckingUser from './auth/CheckingUser';
import GroupServer from './GroupServer.js';

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
      <Router>
        <Switch>
          <PrivateRoute exact path="/" component={Dashboard} />
          <PrivateRoute exact path="/update-profile" component={UpdateProfile} />
          <PrivateRoute path="/checking-user" component={CheckingUser} />
          <PrivateRoute exact path="/group/:serverId" component={GroupServer} />
          <Route path="/signup" component={Signup} />
          <Route path="/login" component={Login} />
        </Switch>
      </Router>
    </div>
  );
}
