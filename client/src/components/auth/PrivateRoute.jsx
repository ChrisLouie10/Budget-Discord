import React, { useState, useEffect, useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Context } from '../../Store';
import ServersList from '../ServersList';
import Loading from '../Loading';

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  component: PropTypes.any.isRequired,
};

// Component creating a private route
export default function PrivateRoute({ component: Component, ...rest }) {
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

    const currState = { ...state };
    const { chatLogs } = currState;
    if (messageObject.type === 'duplicateMessage') {
      const index = chatLogs[messageObject.textChannelId].length - 1;
      chatLogs[messageObject.textChannelId][index] = messageObject.message;
    } else if (messageObject.type === 'message') {
      chatLogs[messageObject.textChannelId].push(messageObject.message);
    }
    setState(currState);
  }

  useEffect(async () => {
    const currState = { ...state };
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
          currState.user = data.user;
          if (data.success) {
            const ws = new WebSocket(process.env.REACT_APP_wssURI);
            if (ws) {
              ws.addEventListener('message', handleWSSMessage);
            }
            currState.ws = ws;
          }
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
