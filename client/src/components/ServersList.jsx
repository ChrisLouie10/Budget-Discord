import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Context } from '../contexts/Store';
import { GroupServersContext } from '../contexts/groupServers-context';
import Popup from './popups/Popup';
import CreateServerForm from './popups/CreateServerForm';

export default function ServersList() {
  const [state, setState] = useContext(Context);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [groupServerId, setGroupServerId] = useState('');
  const [openPopupCreate, setOpenPopupCreate] = useState(false);
  const params = useParams();

  useEffect(() => {
    if (params) {
      setGroupServerId(params.groupServerId);
    }
  }, [groupServers, params]);

  // Displays the group servers the user is a member of
  // Group Server name will be highlighted "#b5fff3" if the user is in that group server page

  function displayServers() {
    return (
      <>
        {
          // eslint-disable-next-line
          Object.entries(groupServers).map(([key, value]) => {
            if (value) {
              const textChannelId = Object.keys(value.textChannels)[0];
              return (
                <li key={key}>
                  {
                    key === groupServerId
                      ? (
                        <Link onClick={(e) => e.preventDefault()} style={{ color: '#b5fff3' }} to={{ pathname: `/group/${key}/${textChannelId}` }}>
                          {value.name}
                        </Link>
                      )
                      : (
                        <Link className="text-reset" to={{ pathname: `/group/${key}/${textChannelId}` }}>
                          {value.name}
                        </Link>
                      )
                    }
                </li>
              );
            }
          })
        }
      </>
    );
  }

  return (
    <div className="wrapper w-100">
      <nav id="sidebar">
        <div>
          <h5 className="text-white">Budget-Discord</h5>
        </div>
        <ul className="list-unstyled text-white">
          <li>
            <Link className="text-reset" to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link className="text-reset" to="/friends">Friends</Link>
          </li>
          {displayServers()}
          <li onClick={() => { if (!openPopupCreate) setOpenPopupCreate(true); }}>
            <Link className="text-reset" to="#">Create Server</Link>
            <Popup
              title="Create New Server"
              openPopup={openPopupCreate}
              setOpenPopup={setOpenPopupCreate}
            >
              <CreateServerForm />
            </Popup>
          </li>
        </ul>
      </nav>
    </div>
  );
}
