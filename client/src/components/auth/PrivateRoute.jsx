import React, { useState, useEffect, useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Context } from '../../contexts/Store';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';
import { ChatLogsContext } from '../../contexts/chatLogs-context';
import { PendingMessagesContext } from '../../contexts/pendingMessages-context';
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
  const [pendingMessages, setPendingMessages] = useContext(PendingMessagesContext);
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

    if (messageObject.method === 'message') {
      const { message } = messageObject;
      if (message) {
        setChatLogs((currChatLogs) => {
          const currLogs = { ...currChatLogs };
          if (currLogs[messageObject.channelId]) {
            currLogs[messageObject.channelId].push(message);
          }
          return currLogs;
        });
        if (message.author === localStorage.getItem('user_id_cache')) {
          setPendingMessages((currPendingMessages) => {
            const currMessages = { ...currPendingMessages };
            const pendingChannelMessages = currMessages[messageObject.channelId];
            if (pendingChannelMessages) {
              let index = -1;
              for (let i = 0; i < pendingChannelMessages.length; i += 1) {
                const pendingMessage = pendingChannelMessages[i];
                const pTimestampDate = new Date(pendingMessage.timestamp);
                const timestampDate = new Date(message.timestamp);
                if (pendingMessage.content === message.content && pTimestampDate.toString() == timestampDate.toString()) {
                  index = i;
                  break;
                }
              }
              if (index >= 0) pendingChannelMessages.splice(index, 1);
            }
            return currMessages;
          });
        }
      }
    }
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
          localStorage.setItem('user_id_cache', data.user._id);
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
          if (_user) {
            const response = await fetch('/api/group-servers/', {
              method: 'GET',
              headers,
            });
            const data = await response.json();
            if (response.status === 200) setGroupServers(data.groupServers);
            else console.log(data.message);
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
            <div style={{ display: 'flex', width: '100%', height: '100%' }}>
              <div className="col-1" style={{ minHeight: '100vh', background: '#212121' }}>
                <ServersList />
              </div>
              <Component {...props} />
            </div>
          )}
        />
      </div>
    </div>
  );
}

PrivateRoute.propTypes = propTypes;
