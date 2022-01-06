import React, { useState, useEffect, useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Context } from '../../Store';
import ServersList from '../ServersList';
import Loading from '../Loading';

// Component creating a private route
export default function PrivateRoute({ component: Component, ...rest }) {
  const [state, setState] = useContext(Context);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  // Repeatedly attempts to contact ws server with "callback" until ws server is online
  /*
  function waitForWSConnection(callback, interval) {
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) callback();
      else {
        setTimeout(() => {
          waitForWSConnection(callback, interval);
        }, interval);
      }
    }
  }

  function handleWSSMessage(message) {
    if (mounted) {
      let parsedMessage;
      try {
        parsedMessage = JSON.parse(message.data);
      } catch (e) {
        console.log('Message from wss could not be parsed!', message);
        return;
      }

      // Check whether message from ws server is valid
      if (parsedMessage.type === 'duplicateMessage') {
        const _chatLogs = { ...chatLogsRef.current };
        const index = _chatLogs[parsedMessage.textChannelId].length - 1;
        _chatLogs[parsedMessage.textChannelId][index] = parsedMessage.message;
        setChatLogs({ ..._chatLogs });
      } else if (parsedMessage.type === 'message') {
        const _chatLogs = { ...chatLogsRef.current };
        _chatLogs[parsedMessage.textChannelId].push(parsedMessage.message);
        setChatLogs({ ..._chatLogs });
      }
    }
  }

  function sendMessage(message, groupServerId, textChannelId) {
    if (mounted) {
      // Create data
      const data = {
        type: 'message',
        textChannelId,
        serverId: groupServerId,
        message,
      };
      // Send data over to ws server
      waitForWSConnection(() => {
        ws.send(JSON.stringify(data));
      }, 500);
    }
  }
  */

  useEffect(async () => {
    const headers = {
      'Content-Type': 'application/json',
    };

    /*
    ws = new WebSocket(process.env.REACT_APP_wssURI);

    // Set up websocket
    if (ws) {
      ws.addEventListener('message', handleWSSMessage);
    }
    */
    const currState = { ...state };
    // Verify user
    await fetch('/api/user', {
      method: 'GET',
      headers,
    }).then((response) => response.json())
      .then((data) => {
        currState.user = data.user;
        setSuccess(data.success);
        return data.user;
      })
      .then(async (user) => {
        let response;
        if (user) {
          response = await fetch('/api/groupServer/find', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              type: 'find',
              userId: user._id,
            }),
          });
          return response.json();
        } return null;
      })
      .then((data) => {
        if (data) {
          currState.groupServers = data.groupServers;
          setState(currState);
        }
      })
      .catch(() => (setSuccess(false)))
      .finally(() => (setLoading(false)));
  }, []);

  if (!loading) {
    return (
      <div className="container-fluid">
        <div className="row">
          <Route
            {...rest}
            render={(props) => ((success)
              ? (
                <>
                  <div className="col-1" style={{ minHeight: '100vh', background: '#212121' }}>
                    <ServersList />
                  </div>
                  <Component {...props} />
                </>
              )
              : <Redirect to="/login" />)}
          />
        </div>
      </div>
    );
  }

  return <Loading />;
}

PrivateRoute.propTypes = {
  // eslint-disable-next-line
  component: PropTypes.any.isRequired,
};
