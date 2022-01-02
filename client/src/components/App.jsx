import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Signup from './auth/Signup';
import Dashboard from './auth/Dashboard';
import Login from './auth/Login';
import PrivateRoute from './auth/PrivateRoute';
import GroupServer from './groupserver/GroupServer';
import Friends from './friends/Friends';
import JoinGroupServer from './groupserver/JoinGroupServer';
import ChangeName from './auth/ChangeName';
import DeleteAccount from './auth/DeleteAccount';
import ChangePassword from './auth/ChangePassword';

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
    <Router>
      <Switch>
        <PrivateRoute exact path="/" component={Dashboard} />
        <PrivateRoute exact path="/friends" component={Friends} />
        <PrivateRoute exact path="/dashboard" component={Dashboard} />
        <PrivateRoute exact path="/change-name" component={ChangeName} />
        <PrivateRoute exact path="/change-password" component={ChangePassword} />
        <PrivateRoute exact path="/delete-account" component={DeleteAccount} />
        <PrivateRoute exact path="/group/:groupServerId" component={GroupServer} />
        <PrivateRoute exact path="/group/:groupServerId/:textChannelId" component={GroupServer} />
        <PrivateRoute exact path="/join/:inviteCode" component={JoinGroupServer} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Login} />
      </Switch>
    </Router>
  );
}
