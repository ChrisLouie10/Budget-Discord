import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import { GroupServersContext } from '../../contexts/groupServers-context';
import InviteForm from './InviteForm';
import CreateChannelForm from './CreateChannelForm';
import DeleteChannelForm from './DeleteChannelForm';
import DeleteGroupServerForm from './DeleteGroupServerForm';
import LeaveGroupServerForm from './LeaveGroupServerForm';

export default function Actions({
  actionDialog, setActionTitle, setActionDialog, setOpenPopup,
}) {
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const { groupServerId } = useParams();
  // eslint-disable-next-line
  function displayContents() {
    if (actionDialog === 0) {
      return (
        <ul className="list-unstyled">
          { (groupServers[groupServerId].owner
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
            : <></> }
          {(!groupServers[groupServerId].owner)
            ? (
              <li onClick={() => { setActionDialog(5); setActionTitle('Leave Group Server'); }}>
                <a className="text-reset" role="button">Leave Group Server</a>
              </li>
            )
            : <></>}
        </ul>
      );
    }
    if (actionDialog === 1) {
      return <InviteForm />;
    }
    if (actionDialog === 2) {
      return (
        <CreateChannelForm
          setOpenPopup={setOpenPopup}
        />
      );
    }
    if (actionDialog === 3) {
      return <DeleteChannelForm />;
    }
    if (actionDialog === 4) {
      return <DeleteGroupServerForm />;
    }
    if (actionDialog === 5) {
      return (
        <LeaveGroupServerForm
          setOpenPopup={setOpenPopup}
        />
      );
    }
  }

  return (
    displayContents()
  );
}

Actions.propTypes = {
  actionDialog: PropTypes.number.isRequired,
  setActionTitle: PropTypes.func.isRequired,
  setActionDialog: PropTypes.func.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
};
