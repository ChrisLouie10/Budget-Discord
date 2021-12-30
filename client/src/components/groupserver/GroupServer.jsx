import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import TextChannel from './textchat/TextChannel';
import ServerSidebar from '../ServerSidebar';

export default function GroupServer(props) {
  const {
    user, rest, groupServers, sendMessage, chatLogs, setChatLogs, uri, setUser, setGroupServers,
  } = props;
  const [mounted, setMounted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userAccess, setUserAccess] = useState(false);

  useEffect(async () => function cleanup() {
    setMounted(false);
  }, []);

  // Upon intialization, verify that the user is authorized to be in the group server
  // If the user is not authorized, userAccess = false which redirects the user to "/dashboard"
  useEffect(async () => {
    if (user) {
      try {
        await fetch('/api/groupServer/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: localStorage.getItem('Authorization'),
          },
          body: JSON.stringify({
            type: 'verify',
            userId: user._id,
            groupServerId: rest.computedMatch.params.groupServerId,
            textChannelId: rest.computedMatch.params.textChannelId
              ? rest.computedMatch.params.textChannelId
              : Object.keys(groupServers[rest.computedMatch.params.groupServerId].textChannels)[0],
          }),
        }).then((response) => response.json())
          .then(async (data) => {
            if (mounted) {
              setUserAccess(data.access);
            }
          });
      } finally {
        if (mounted) setLoading(false);
      }
    } else setUserAccess(false);
  }, [rest.computedMatch.params.groupServerId]);

  function _sendMessage(message) {
    const { groupServerId } = rest.computedMatch.params;
    const textChannelId = rest.computedMatch.params.textChannelId
      ? rest.computedMatch.params.textChannelId : Object.keys(groupServers[groupServerId].textChannels)[0];

    // Send message over to server
    sendMessage(message, groupServerId, textChannelId);
  }

  return (
    <>
      {
        loading
          ? <p>Loading</p>
          : ((userAccess)
            ? (
              <>
                <div className="col-1" style={{ minHeight: '100vh', background: '#292929' }}>
                  <ServerSidebar
                    uri={uri}
                    user={user}
                    setUser={setUser}
                    groupServers={groupServers}
                    setGroupServers={setGroupServers}
                    groupServerId={rest.computedMatch.params.groupServerId}
                    textChannelId={rest.computedMatch.params.textChannelId
                      ? rest.computedMatch.params.textChannelId : Object.keys(groupServers[rest.computedMatch.params.groupServerId].textChannels)[0]}
                  />
                </div>
                <TextChannel
                  sendMessage={_sendMessage}
                  chatLogs={chatLogs}
                  setChatLogs={setChatLogs}
                  textChannelId={rest.computedMatch.params.textChannelId
                    ? rest.computedMatch.params.textChannelId : Object.keys(groupServers[rest.computedMatch.params.groupServerId].textChannels)[0]}
                  user={user}
                />
              </>
            )
            : <Redirect to="/dashboard" />)
      }
    </>
  );
}

GroupServer.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  user: PropTypes.object.isRequired,
  // eslint-disable-next-line
  rest: PropTypes.object,
  // eslint-disable-next-line
  groupServers: PropTypes.object,
  // eslint-disable-next-line react/forbid-prop-types
  chatLogs: PropTypes.object.isRequired,
  // eslint-disable-next-line react/require-default-props
  groupServerId: PropTypes.string,
  uri: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
  setChatLogs: PropTypes.func.isRequired,
  setGroupServers: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
};
