import React, { useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';
import Loading from '../Loading';

export default function JoinGroupServer() {
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const history = useHistory();
  const { inviteCode } = useParams();

  useEffect(async () => {
    let groupServerId;
    if (inviteCode) {
      await fetch('/api/group-servers/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inviteCode,
        }),
      }).then(async (response) => {
        if (response.status !== 204) {
          const data = await response.json();
          if (response.status === 200) {
            groupServerId = data.groupServerId;
            const _groupServers = { ...groupServers };
            _groupServers[groupServerId] = data.groupServer;
            setGroupServers(_groupServers);
            history.push(`/group/${groupServerId}`);
          } else {
            console.error(data.message);
            history.push('/friends');
          }
        } else history.push('/friends');
      });
    }
  }, []);

  return (
    <Loading />
  );
}
