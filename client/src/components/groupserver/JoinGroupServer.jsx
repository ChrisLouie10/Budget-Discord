import React, { useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';
import Loading from '../Loading';

export default function JoinGroupServer() {
  const [user, setUser] = useContext(UserContext);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const controller = new AbortController();
  const { signal } = controller;
  const history = useHistory();
  const { inviteCode } = useParams();

  useEffect(async () => {
    let groupServerId;
    if (inviteCode) {
      await fetch('/api/group-servers/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'join',
          inviteCode,
          userId: user._id,
        }),
        signal,
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            groupServerId = data.groupServerId;
            const _groupServers = { ...groupServers };
            _groupServers[groupServerId] = data.groupServer;
            setGroupServers(_groupServers);
            history.push(`/group/${groupServerId}`);
          } else {
            console.log(data.message);
            history.push('/dashboard');
          }
        });
    }
    return function cleanup() {
      controller.abort();
    };
  }, []);

  return (
    <Loading />
  );
}
