import React, {
  useContext, useEffect, useState,
} from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import { Context } from '../../Store';
import InviteForm from './InviteForm';
import CreateChannelForm from './CreateChannelForm';
import DeleteChannelForm from './DeleteChannelForm';
import DeleteGroupServerForm from './DeleteGroupServerForm';
import LeaveGroupServerForm from './LeaveGroupServerForm';

export default function Actions({
  openPopup, setOpenPopup, actionDialog, setActionDialog,
}) {
  const [state, setState] = useContext(Context);
  const [groupServerName, setGroupServerName] = useState('Group Server');
  const { groupServerId } = useParams();

  useEffect(() => {
    const { groupServers } = state;
    const groupServer = groupServers[groupServerId];
    if (groupServer) {
      setGroupServerName(groupServer.name);
    }
  }, [groupServerId]);

  function onEscapeKeyDown() {
    setOpenPopup(false);
  }

  // eslint-disable-next-line
  function displayContents() {
    if (state.groupServers[groupServerId]) {
      if (actionDialog === 0) {
        return (
          <>
            <DialogTitle>
              <div>Actions</div>
            </DialogTitle>
            <DialogContent>
              <ul className="list-unstyled">
                {
                              (state.groupServers[groupServerId].owner
                              || state.groupServers[groupServerId].admin)
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
                              (!state.groupServers[groupServerId].owner)
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
              <InviteForm />
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
              <DeleteChannelForm />
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
              <DeleteGroupServerForm />
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
                setOpenPopup={setOpenPopup}
              />
            </DialogContent>
          </>
        );
      }
    } return <div />;
  }

  return (
    <Dialog open={openPopup} maxWidth="md" onEscapeKeyDown={onEscapeKeyDown}>
      {displayContents()}
    </Dialog>
  );
}

Actions.propTypes = {
  openPopup: PropTypes.bool.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
  actionDialog: PropTypes.number.isRequired,
  setActionDialog: PropTypes.func.isRequired,
};
