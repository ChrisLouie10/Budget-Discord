import React from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';

export default function FriendSidebar(props) {
  const {
    friends,
  } = props;
  const { friendId } = useParams();

  // TODO: Change to display private chats
  // eslint-disable-next-line
  function displayFriends() {
    if (friends) {
      return (
        <>
          {
            friends.map((friend) => (
              <li key={friend.id}>
                {
                  friendId === friend.id
                    ? (
                      // eslint-disable-next-line
                      <Link style={{ color: '#b5fff3' }} to={{ pathname: `/friends/${friend.id}` }}>
                        {friend.name}
                        {' '}
                        #
                        {friend.numberID}
                        {' '}
                      </Link>
                    )
                    : (
                      // eslint-disable-next-line
                      <Link className="text-reset" to={{ pathname: `/friends/${friend.id}` }}>
                        {friend.name}
                        {' '}
                        #
                        {friend.numberID}
                        {' '}
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
          {displayFriends()}
        </ul>
      </div>
    </nav>
  );
}

// https://reactjs.org/docs/typechecking-with-proptypes.html
FriendSidebar.propTypes = {
  // eslint-disable-next-line
  friends: PropTypes.object.isRequired,
};
