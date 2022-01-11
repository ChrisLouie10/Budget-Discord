import React from 'react';
import PropTypes from 'prop-types';
import InviteForm from './InviteForm';
import CreateChannelForm from './CreateChannelForm';
import DeleteChannelForm from './DeleteChannelForm';
import DeleteGroupServerForm from './DeleteGroupServerForm';
import LeaveGroupServerForm from './LeaveGroupServerForm';

export default function Actions({
  actionDialog, groupServers, groupServerId, setActionTitle, setActionDialog, setOpenPopup, uri, user, setGroupServers, textChannelId, setUser, groupServerName,
}) {
  // eslint-disable-next-line
  function displayContents() {
    if (actionDialog === 0) {
      return (
        <>
          <ul className="list-unstyled">
            {
                          (groupServers[groupServerId].owner
                          || groupServers[groupServerId].admin)
                            ? (
                              <>
                                <li onClick={() => { setActionDialog(1); setActionTitle('Invite'); }}>
                                  <a className="text-reset" role="button">Invite</a>
                                </li>
                                <li onClick={() => { setActionDialog(2); setActionTitle('Create Channel'); }}>
                                  <a className="text-reset" role="button">Create Channel</a>
                                </li>
                                <li onClick={() => { setActionDialog(3); setActionTitle('Delete Current Channel'); }}>
                                  <a className="text-reset" role="button">Delete Current Channel</a>
                                </li>
                                <li onClick={() => { setActionDialog(4); setActionTitle('Delete Group Server'); }}>
                                  <a className="text-reset" role="button">Delete Group Server</a>
                                </li>
                              </>
                            )
                            : <></>
                      }
            {
                          (!groupServers[groupServerId].owner)
                            ? (
                              <li onClick={() => { setActionDialog(5); setActionTitle('Leave Group Server'); }}>
                                <a className="text-reset" role="button">Leave Group Server</a>
                              </li>
                            )
                            : <></>
                      }
          </ul>
        </>
      );
    }
    if (actionDialog === 1) {
      return (
        <>
          <InviteForm
            uri={uri}
            userId={user._id}
            groupServers={groupServers}
            setGroupServers={setGroupServers}
            groupServerId={groupServerId}
          />
        </>
      );
    }
    if (actionDialog === 2) {
      return (
        <>
          <CreateChannelForm
            userId={user._id}
            groupServerId={groupServerId}
            groupServers={groupServers}
            setGroupServers={setGroupServers}
            setOpenPopup={setOpenPopup}
          />
        </>
      );
    }
    if (actionDialog === 3) {
      return (
        <>
          <DeleteChannelForm
            userId={user._id}
            textChannelId={textChannelId}
            groupServerId={groupServerId}
            groupServers={groupServers}
            setGroupServers={setGroupServers}
          />
        </>
      );
    }
    if (actionDialog === 4) {
      return (
        <>
          <DeleteGroupServerForm
            userId={user._id}
            groupServers={groupServers}
            setGroupServers={setGroupServers}
            groupServerId={groupServerId}
            groupServerName={groupServerName}
          />
        </>
      );
    }
    if (actionDialog === 5) {
      return (
        <>
          <LeaveGroupServerForm
            userId={user._id}
            setUser={setUser}
            groupServers={groupServers}
            setGroupServers={setGroupServers}
            groupServerId={groupServerId}
            groupServerName={groupServerName}
            setOpenPopup={setOpenPopup}
          />
        </>
      );
    }
  }

  return (
    <>
      {displayContents()}
    </>
  );
}

Actions.propTypes = {
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
  // eslint-disable-next-line
  groupServers: PropTypes.object.isRequired,
  actionDialog: PropTypes.number.isRequired,
  groupServerId: PropTypes.string.isRequired,
  setActionTitle: PropTypes.func.isRequired,
  setActionDialog: PropTypes.func.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
  uri: PropTypes.string.isRequired,
  setGroupServers: PropTypes.func.isRequired,
  textChannelId: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
  groupServerName: PropTypes.string.isRequired,
};
