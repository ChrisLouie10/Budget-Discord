import React, { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import UserList from './UserList';
import TextChannel from './textchat/TextChannel';
import ServerSidebar from '../ServerSidebar';
import Loading from '../Loading';

export default function GroupServer() {
  const [loading, setLoading] = useState(true);
  const [userAccess, setUserAccess] = useState(false);
  const params = useParams();
  const { groupServerId } = useParams();

  // Upon intialization, verify that the user is authorized to be in the group server
  // If the user is not authorized, userAccess = false which redirects the user to "/dashboard"
  useEffect(async () => {
    if (groupServerId) {
      try {
        await fetch(`/api/group-servers/${groupServerId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((response) => {
          setUserAccess(response.status === 200);
        });
      } finally {
        setLoading(false);
      }
    }
  }, [params]);

  if (loading) return <Loading />;
  if (!userAccess) return <Redirect to="/friends" />;
  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div className="col-1" style={{ minHeight: '100vh', background: '#292929' }}>
        <ServerSidebar />
      </div>
      <TextChannel />
      <UserList />
    </div>
  );
}
