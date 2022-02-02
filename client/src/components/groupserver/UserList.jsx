import React, { useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { GroupServersContext } from '../../contexts/groupServers-context';

export default function UserList() {
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const { groupServerId } = useParams();

  const displayUsers = useMemo(() => {
    if (groupServers[groupServerId]) {
      return (
        <ul className="list-unstyled">
          {Object.keys(groupServers[groupServerId].users).map((userId) => {
            const user = groupServers[groupServerId].users[userId];
            return (
              <li key={userId}>
                {user.name}
              </li>
            );
          })}
        </ul>
      );
    } return <div />;
  }, [groupServerId]);

  return (
    <div style={{ width: '100%', background: '#212121', paddingLeft: '0.5rem' }} className="text-white">
      <h3>Users</h3>
      {displayUsers}
    </div>
  );
}
