import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Actions from './popups/Actions';
import Popup from './popups/Popup';

export default function ServerSidebar(props) {
  const {
    groupServers, groupServerId, uri, user, setUser, setGroupServers, textChannelId,
  } = props;
  const [mounted, setMounted] = useState(true);
  const [groupServerName, setGroupServerName] = useState('Group Server');
  const [actionTitle, setActionTitle] = useState('Actions');
  const [actionDialog, setActionDialog] = useState(0);
  const [openPopup, setOpenPopup] = useState(false);

  useEffect(() => function cleanup() {
    setMounted(false);
  }, []);

  useEffect(() => {
    if (groupServers) {
      setGroupServerName(groupServers[groupServerId].name);
    }
  }, [groupServerId]);

  function handleRightClick(e) {
    if (e.nativeEvent.which === 3 || e.type === 'contextmenu') {
      e.preventDefault();
    }
  }

  // eslint-disable-next-line
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
                uri={uri}
                mounted={mounted}
                actionDialog={actionDialog}
                setActionTitle={setActionTitle}
                setActionDialog={setActionDialog}
                setOpenPopup={setOpenPopup}
                user={user}
                setUser={setUser}
                groupServerName={groupServerName}
                groupServers={groupServers}
                setGroupServers={setGroupServers}
                groupServerId={groupServerId}
                textChannelId={textChannelId}
              />
            </Popup>
          </li>
          {displayTextChannels()}
        </ul>
      </div>
    </nav>
  );
}

// https://reactjs.org/docs/typechecking-with-proptypes.html
ServerSidebar.propTypes = {
  // eslint-disable-next-line
  groupServers: PropTypes.object.isRequired,
  setGroupServers: PropTypes.func.isRequired,
  groupServerId: PropTypes.string.isRequired,
  textChannelId: PropTypes.string,
  uri: PropTypes.string.isRequired,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
  setUser: PropTypes.func.isRequired,
};

ServerSidebar.defaultProps = {
  textChannelId: '',
};
