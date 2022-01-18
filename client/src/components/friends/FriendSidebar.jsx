import React from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';

export default function FriendSidebar(props) {
  const {
    privateChats,
  } = props;
  const { privateChatId } = useParams();

  // TODO: Change to display private chats
  // eslint-disable-next-line
  function displayChats() {
    if (privateChats) {
      return (
        <>
          {
            privateChats.map((chat) => (
              <li key={chat.id}>
                {
                  privateChatId === chat.id
                    ? (
                      // eslint-disable-next-line
                      <Link style={{ color: '#b5fff3' }} to={{ pathname: `/friends/${chat.id}` }}>
                        {chat.name}
                      </Link>
                    )
                    : (
                      // eslint-disable-next-line
                      <Link className="text-reset" to={{ pathname: `/friends/${chat.id}` }}>
                        {chat.name}
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
        <Link to={{ pathname: '/friends' }}>Friends</Link>
      </div>
      <div className="row">
        <ul className="list-unstyled text-white">
          {displayChats()}
        </ul>
      </div>
    </nav>
  );
}

// https://reactjs.org/docs/typechecking-with-proptypes.html
FriendSidebar.propTypes = {
  // eslint-disable-next-line
  privateChats: PropTypes.object.isRequired,

};
