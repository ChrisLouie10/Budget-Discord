import React, { useState, createContext } from 'react';
import PropTypes from 'prop-types';

const initialGroupServers = {};

export const GroupServersContext = createContext();

export default function GroupServersProvider({ children }) {
  const [groupServers, setGroupServers] = useState(initialGroupServers);
  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <GroupServersContext.Provider value={[groupServers, setGroupServers]}>{children}</GroupServersContext.Provider>
  );
}

GroupServersProvider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};
