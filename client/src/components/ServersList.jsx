import React, { useState, useContext, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GroupServersContext } from '../contexts/groupServers-context';
import Popup from './popups/Popup';
import CreateServerForm from './popups/CreateServerForm';
import Dashboard from './popups/Dashboard';

export default function ServersList() {
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [groupServerId, setGroupServerId] = useState('');
  const [dashboardTitle, setDashboardTitle] = useState('Dashboard');
  const [dashboardDialog, setDashboardDialog] = useState(0);
  const [openPopupDashboard, setOpenPopupDashboard] = useState(false);
  const [openPopupCreateServer, setOpenPopupCreateServer] = useState(false);
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
          <li onClick={() => {
            if (!openPopupDashboard) {
              setOpenPopupDashboard(true);
              setDashboardTitle('Dashboard');
              setDashboardDialog(0);
            }
          }}
          >
            <Link className="text-reset" to="#">Dashboard</Link>
            <Popup
              title={dashboardTitle}
              openPopup={openPopupDashboard}
              setOpenPopup={setOpenPopupDashboard}
            >
              <Dashboard
                dashboardDialog={dashboardDialog}
                setDashboardTitle={setDashboardTitle}
                setDashboardDialog={setDashboardDialog}
                setOpenPopup={setOpenPopupDashboard}
              />
            </Popup>
          </li>
          <li>
            <Link className="text-reset" to="/friends">Friends</Link>
          </li>
          {displayServers()}
          <li onClick={() => { if (!openPopupCreateServer) setOpenPopupCreateServer(true); }}>
            <Link className="text-reset" to="#">Create Server</Link>
            <Popup
              title="Create New Server"
              openPopup={openPopupCreateServer}
              setOpenPopup={setOpenPopupCreateServer}
            >
              <CreateServerForm />
            </Popup>
          </li>
        </ul>
      </nav>
    </div>
  );
}
