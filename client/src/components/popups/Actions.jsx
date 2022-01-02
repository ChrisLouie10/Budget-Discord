import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import InviteForm from './InviteForm';
import CreateChannelForm from './CreateChannelForm';
import DeleteChannelForm from './DeleteChannelForm';
import DeleteGroupServerForm from './DeleteGroupServerForm';
import LeaveGroupServerForm from './LeaveGroupServerForm';

export default function Actions({
  openPopup, setOpenPopup, actionDialog, groupServers, groupServerId, setActionDialog, uri, user, setGroupServers, textChannelId, setUser, groupServerName,
}) {
  function onEscapeKeyDown() {
    setOpenPopup(false);
  }

  // eslint-disable-next-line
  function displayContents() {
    if (actionDialog === 0) {
      return (
        <>
          <DialogTitle>
            <div>Actions</div>
          </DialogTitle>
          <DialogContent>
            <ul className="list-unstyled">
              {
                            (groupServers[groupServerId].owner
                            || groupServers[groupServerId].admin)
                              ? (
                                <>
                                  <li onClick={() => setActionDialog(1)}>
                                    <a className="text-reset" role="button">Invite</a>
                                  </li>
                                  <li onClick={() => setActionDialog(2)}>
                                    <a className="text-reset" role="button">Create Channel</a>
                                  </li>
                                  <li onClick={() => setActionDialog(3)}>
                                    <a className="text-reset" role="button">Delete Current Channel</a>
                                  </li>
                                  <li onClick={() => setActionDialog(4)}>
                                    <a className="text-reset" role="button">Delete Group Server</a>
                                  </li>
                                </>
                              )
                              : <></>
                        }
              {
                            (!groupServers[groupServerId].owner)
                              ? (
                                <li onClick={() => setActionDialog(5)}>
                                  <a className="text-reset" role="button">Leave Group Server</a>
                                </li>
                              )
                              : <></>
                        }
            </ul>
          </DialogContent>
        </>
      );
    }
    if (actionDialog === 1) {
      return (
        <>
          <DialogTitle>
            <div>Invite</div>
          </DialogTitle>
          <DialogContent>
            <InviteForm
              uri={uri}
              userId={user._id}
              groupServers={groupServers}
              setGroupServers={setGroupServers}
              groupServerId={groupServerId}
            />
          </DialogContent>
        </>
      );
    }
    if (actionDialog === 2) {
      return (
        <>
          <DialogTitle>
            <div>Create Channel</div>
          </DialogTitle>
          <DialogContent>
            <CreateChannelForm
              userId={user._id}
              groupServerId={groupServerId}
              groupServers={groupServers}
              setGroupServers={setGroupServers}
              setOpenPopup={setOpenPopup}
            />
          </DialogContent>
        </>
      );
    }
    if (actionDialog === 3) {
      return (
        <>
          <DialogTitle>
            <div>Delete Current Channel</div>
          </DialogTitle>
          <DialogContent>
            <DeleteChannelForm
              userId={user._id}
              textChannelId={textChannelId}
              groupServerId={groupServerId}
              groupServers={groupServers}
              setGroupServers={setGroupServers}
            />
          </DialogContent>
        </>
      );
    }
    if (actionDialog === 4) {
      return (
        <>
          <DialogTitle>
            <div>Delete Group Server</div>
          </DialogTitle>
          <DialogContent>
            <DeleteGroupServerForm
              userId={user._id}
              groupServers={groupServers}
              setGroupServers={setGroupServers}
              groupServerId={groupServerId}
              groupServerName={groupServerName}
            />
          </DialogContent>
        </>
      );
    }
    if (actionDialog === 5) {
      return (
        <>
          <DialogTitle>
            <div>
              Leave
              {groupServerName}
            </div>
          </DialogTitle>
          <DialogContent>
            <LeaveGroupServerForm
              userId={user._id}
              setUser={setUser}
              groupServers={groupServers}
              setGroupServers={setGroupServers}
              groupServerId={groupServerId}
              groupServerName={groupServerName}
              setOpenPopup={setOpenPopup}
            />
          </DialogContent>
        </>
      );
    }
  }

  return (
    <Dialog open={openPopup} maxWidth="md" onEscapeKeyDown={onEscapeKeyDown}>
      {displayContents()}
    </Dialog>
  );
}

Actions.propTypes = {
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
  // eslint-disable-next-line
  groupServers: PropTypes.object.isRequired,
  openPopup: PropTypes.bool.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
  actionDialog: PropTypes.number.isRequired,
  groupServerId: PropTypes.string.isRequired,
  setActionDialog: PropTypes.func.isRequired,
  uri: PropTypes.string.isRequired,
  setGroupServers: PropTypes.func.isRequired,
  textChannelId: PropTypes.string.isRequired,
  setUser: PropTypes.func.isRequired,
  groupServerName: PropTypes.string.isRequired,
};
