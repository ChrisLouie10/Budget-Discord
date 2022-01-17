import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import StoreProvider from '../contexts/Store';
import UserProvider from '../contexts/user-context';
import GroupServersProvider from '../contexts/groupServers-context';
import ChatLogsProvider from '../contexts/chatLogs-context';
import PendingMessagesProvider from '../contexts/pendingMessages-context';
import Signup from './auth/Signup';
import Login from './auth/Login';
import PrivateRoute from './auth/PrivateRoute';
import GroupServer from './groupserver/GroupServer';
import Friends from './friends/Friends';
import JoinGroupServer from './groupserver/JoinGroupServer';

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
    <StoreProvider>
      <UserProvider>
        <GroupServersProvider>
          <ChatLogsProvider>
            <PendingMessagesProvider>
              <Router>
                <Switch>
                  <PrivateRoute exact path="/" component={Friends} />
                  <PrivateRoute exact path="/friends" component={Friends} />
                  <PrivateRoute exact path="/friends/:privateChatId" component={Friends} />
                  <PrivateRoute exact path="/group/:groupServerId" component={GroupServer} />
                  <PrivateRoute exact path="/group/:groupServerId/:textChannelId" component={GroupServer} />
                  <PrivateRoute exact path="/join/:inviteCode" component={JoinGroupServer} />
                  <Route path="/signup" component={Signup} />
                  <Route path="/login" component={Login} />
                </Switch>
              </Router>
            </PendingMessagesProvider>
          </ChatLogsProvider>
        </GroupServersProvider>
      </UserProvider>
    </StoreProvider>
  );
}
