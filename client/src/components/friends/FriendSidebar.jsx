import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import FriendsList from './FriendsList';
import FriendRequests from './FriendRequests';

export default function FriendSidebar(props) {
  const {
    friends, friendRequests, handleFriendAccept, handleFriendDelete, setError, textChannelId,
  } = props;
  const [friendName, setFriendName] = useState('Friend');

  useEffect(() => {
    if (friends) {
      setFriendName(friends[0].name);
    }
  }, [friends]);

  // eslint-disable-next-line
  function displayFriends() {
    if (friends[friends.id]) {
      return (
        <>
          {friends && friends.length > 0 ? friends.map((friend) => <FriendsList handleFriendDelete={handleFriendDelete} setError={setError} key={friend.id} friend={friend} />) : <div /> }
          <hr />
          {friendRequests && friendRequests.length > 0 ? friendRequests.map((friend) => <FriendRequests handleFriendAccept={handleFriendAccept} setError={setError} key={friend.id} friend={friend} />) : <div> </div>}
          {/* {
            Object.entries(friends.textChannels).map(([key, value]) => (
              <li key={key}>
                {
                  textChannelId === key
                    ? (
                      // eslint-disable-next-line
                      <Link style={{ color: '#b5fff3' }} to={{ pathname: `/me/${friend.id}` }}>
                        {value.name}

                      </Link>
                    )
                    : (
                      // eslint-disable-next-line
                      <Link className="text-reset" to={{ pathname: `/me/${friend.id}` }}>
                        {value.name}

                      </Link>
                    )
                  }
              </li>
            ))
            } */}
        </>
      );
    }
  }

  return (
    <nav id="server-side-bar">
      <div className="row">
        <h5 className="text-white">{friendName}</h5>
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
  // eslint-disable-next-line
  friendRequests: PropTypes.object.isRequired,
  handleFriendAccept: PropTypes.func.isRequired,
  handleFriendDelete: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  textChannelId: PropTypes.string,
  // eslint-disable-next-line
  user: PropTypes.object.isRequired,
};

FriendSidebar.defaultProps = {
  textChannelId: '',
};
