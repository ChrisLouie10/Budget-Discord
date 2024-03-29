import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GroupServersContext } from '../contexts/groupServers-context';
import Actions from './popups/Actions';
import Popup from './popups/Popup';

export default function ServerSidebar() {
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [mounted, setMounted] = useState(true);
  const [groupServerName, setGroupServerName] = useState('Group Server');
  const [actionTitle, setActionTitle] = useState('Actions');
  const [actionDialog, setActionDialog] = useState(0);
  const [openPopup, setOpenPopup] = useState(false);
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
            if (!openPopup) {
              setOpenPopup(true);
              setActionTitle('Actions');
              setActionDialog(0);
            }
          }}
          >
            <Link className="text-reset" to="#">Actions</Link>
            <Popup
              title={actionTitle}
              openPopup={openPopup}
              setOpenPopup={setOpenPopup}
            >
              <Actions
                mounted={mounted}
                actionDialog={actionDialog}
                setActionTitle={setActionTitle}
                setActionDialog={setActionDialog}
                setOpenPopup={setOpenPopup}
              />
            </Popup>
          </li>
          {displayTextChannels()}
        </ul>
      </div>
    </nav>
  );
}
