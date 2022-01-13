import React, { useState, useEffect, useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Context } from '../../contexts/Store';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';
import { ChatLogsContext } from '../../contexts/chatLogs-context';
import ServersList from '../ServersList';
import Loading from '../Loading';

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  component: PropTypes.any.isRequired,
};

// Component creating a private route
export default function PrivateRoute({ component: Component, ...rest }) {
  const [user, setUser] = useContext(UserContext);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [chatLogs, setChatLogs] = useContext(ChatLogsContext);
  const [state, setState] = useContext(Context);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  function handleWSSMessage(msg) {
    let messageObject;
    try {
      messageObject = JSON.parse(msg.data);
    } catch {
      return;
    }

    setChatLogs((currChatLogs) => {
      const currLogs = { ...currChatLogs };
      if (messageObject.type === 'duplicateMessage') {
        const index = currLogs[messageObject.textChannelId].length - 1;
        currLogs[messageObject.textChannelId][index] = messageObject.message;
      } else if (messageObject.type === 'message') {
        currLogs[messageObject.textChannelId].push(messageObject.message);
      }
      return currLogs;
    });
  }

  useEffect(async () => {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Verify user
    try {
      await fetch('/api/user', {
        method: 'GET',
        headers,
      }).then((response) => response.json())
        .then((data) => {
          setUser(data.user);
          if (data.success) {
            const currState = { ...state };
            const ws = new WebSocket(process.env.REACT_APP_WSS_URI);
            if (ws) {
              ws.addEventListener('message', handleWSSMessage);
            }
            currState.ws = ws;
            setState(currState);
          }
          setSuccess(data.success);
          return data.user;
        })
        .then(async (_user) => {
          let response;
          if (_user) {
            response = await fetch('/api/group-servers/', {
              method: 'GET',
              headers,
            });
            return response.json();
          } return null;
        })
        .then((data) => {
          if (data) {
            setGroupServers(data.groupServers);
          }
        });
    } catch {
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) return <Loading />;
  if (!success) return <Redirect to="/login" />;

  return (
    <div className="container-fluid">
      <div className="row">
        <Route
          {...rest}
          render={(props) => (
            <>
              <div className="col-1" style={{ minHeight: '100vh', background: '#212121' }}>
                <ServersList />
              </div>
              <Component {...props} />
            </>
          )}
        />
      </div>
    </div>
  );
}

PrivateRoute.propTypes = propTypes;
