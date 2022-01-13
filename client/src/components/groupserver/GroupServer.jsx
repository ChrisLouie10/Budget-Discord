import React, { useState, useEffect, useContext } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { Context } from '../../contexts/Store';
import { UserContext } from '../../contexts/user-context';
import TextChannel from './textchat/TextChannel';
import ServerSidebar from '../ServerSidebar';
import Loading from '../Loading';

export default function GroupServer() {
  const [state, setState] = useContext(Context);
  const [user, setUser] = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [userAccess, setUserAccess] = useState(false);
  const params = useParams();
  const { groupServerId, textChannelId } = useParams();

  // Upon intialization, verify that the user is authorized to be in the group server
  // If the user is not authorized, userAccess = false which redirects the user to "/dashboard"
  useEffect(async () => {
    if (groupServerId) {
      try {
        await fetch(`/api/group-server/${groupServerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          /*
          body: JSON.stringify({
            groupServerId,
            textChannelId: textChannelId || Object.keys(state.groupServers[groupServerId].textChannels)[0],
          }),
          */
        }).then((response) => {
          setUserAccess(response.status === 200);
        });
      } finally {
        setLoading(false);
      }
    }
  }, [params]);

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
