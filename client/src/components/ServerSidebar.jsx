import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Context } from '../contexts/Store';
import { GroupServersContext } from '../contexts/groupServers-context';
import Actions from './popups/Actions';

export default function ServerSidebar() {
  const [state, setState] = useContext(Context);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [mounted, setMounted] = useState(true);
  const [groupServerName, setGroupServerName] = useState('Group Server');
  const [actionDialog, setActionDialog] = useState(0);
  const [openPopupActions, setOpenPopupActions] = useState(false);
  const { groupServerId, textChannelId } = useParams();

  useEffect(() => function cleanup() {
    setMounted(false);
  }, []);

  useEffect(() => {
    if (groupServers[groupServerId]) {
      setGroupServerName(groupServers[groupServerId].name);
    }
  }, [groupServerId]);

  function handleRightClick(e) {
    if (e.nativeEvent.which === 3 || e.type === 'contextmenu') {
      e.preventDefault();
    }
  }

  function displayTextChannels() {
    if (groupServers[groupServerId]) {
      return (
        <>
          {
            Object.entries(groupServers[groupServerId].textChannels).map(([key, value]) => (
              <li key={key}>
                {
                  textChannelId === key
                    ? (
                      // eslint-disable-next-line
                      <Link style={{ color: '#b5fff3' }} onContextMenu={handleRightClick} to={{ pathname: `/group/${groupServerId}/${key}` }}>
                        {value.name}
                      </Link>
                    )
                    : (
                      // eslint-disable-next-line
                      <Link className="text-reset" onContextMenu={handleRightClick} to={{ pathname: `/group/${groupServerId}/${key}` }}>
                        {value.name}
                      </Link>
                    )
                  }
              </li>
            ))
            }
        </>
      );
    } return <li />;
  }

  return (
    <nav id="server-side-bar">
      <div className="row">
        <h5 className="text-white">{groupServerName}</h5>
      </div>
      <div className="row">
        <ul className="list-unstyled text-white">
          <li onClick={() => {
            if (!openPopupActions) {
              setOpenPopupActions(true);
              setActionDialog(0);
            }
          }}
          >
            <Link className="text-reset" to="#">Actions</Link>
            <Actions
              openPopup={openPopupActions}
              setOpenPopup={setOpenPopupActions}
              actionDialog={actionDialog}
              setActionDialog={setActionDialog}
            />
          </li>
          {displayTextChannels()}
        </ul>
      </div>
    </nav>
  );
}
