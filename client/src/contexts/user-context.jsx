import React, { useState, createContext } from 'react';
import PropTypes from 'prop-types';

const initialUser = {};

export const UserContext = createContext();

export default function UserProvider({ children }) {
  const [user, setUser] = useState(initialUser);
  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <UserContext.Provider value={[user, setUser]}>{children}</UserContext.Provider>
  );
}

UserProvider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};
