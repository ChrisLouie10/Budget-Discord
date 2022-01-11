import React, { useState, createContext } from 'react';
import PropTypes from 'prop-types';

const initialState = {
  ws: {},
};

export const Context = createContext();

export default function StoreProvider({ children }) {
  const [state, setState] = useState(initialState);
  return (
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    <Context.Provider value={[state, setState]}>{children}</Context.Provider>
  );
}

StoreProvider.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
};
