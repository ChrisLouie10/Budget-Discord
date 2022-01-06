import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Context } from '../Store';
import Actions from './popups/Actions';

export default function ServerSidebar() {
  const [state, setState] = useContext(Context);
  const [mounted, setMounted] = useState(true);
  const [groupServerName, setGroupServerName] = useState('Group Server');
  const [actionDialog, setActionDialog] = useState(0);
  const [openPopupActions, setOpenPopupActions] = useState(false);
  const { groupServerId, textChannelId } = useParams();

  useEffect(() => function cleanup() {
    setMounted(false);
  }, []);

  useEffect(() => {
    if (state.groupServers) {
      setGroupServerName(state.groupServers[groupServerId].name);
    }
  }, [groupServerId]);

  function handleRightClick(e) {
    if (e.nativeEvent.which === 3 || e.type === 'contextmenu') {
      e.preventDefault();
    }
  }

  // eslint-disable-next-line
  function displayTextChannels() {
    if (state.groupServers[groupServerId]) {
      return (
        <>
          {
            Object.entries(state.groupServers[groupServerId].textChannels).map(([key, value]) => (
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
    }
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
            <Actions />
          </li>
          {displayTextChannels()}
        </ul>
      </div>
    </nav>
  );
}
