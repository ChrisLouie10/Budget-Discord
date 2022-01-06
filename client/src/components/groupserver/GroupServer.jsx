import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { Context } from '../../Store';
import TextChannel from './textchat/TextChannel';
import ServerSidebar from '../ServerSidebar';
import Loading from '../Loading';

export default function GroupServer() {
  const [state, setState] = useContext(Context);
  const [loading, setLoading] = useState(true);
  const [userAccess, setUserAccess] = useState(false);
  const params = useParams();
  const { groupServerId, textChannelId } = useParams();

  // Upon intialization, verify that the user is authorized to be in the group server
  // If the user is not authorized, userAccess = false which redirects the user to "/dashboard"
  useEffect(async () => {
    if (groupServerId) {
      try {
        console.log(params);
        await fetch('/api/groupServer/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'verify',
            userId: state.user._id,
            groupServerId,
            textChannelId: textChannelId || Object.keys(state.groupServers[groupServerId].textChannels)[0],
          }),
        }).then((response) => response.json())
          .then(async (data) => {
            setUserAccess(data.access);
          });
      } finally {
        setLoading(false);
      }
    }
  }, [useParams()]);

  if (loading) return <Loading />;
  if (!userAccess) return <Redirect to="/dashboard" />;
  return (
    <>
      <div className="col-1" style={{ minHeight: '100vh', background: '#292929' }}>
        <ServerSidebar />
      </div>
      <TextChannel />
    </>
  );
}

/*
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
*/
