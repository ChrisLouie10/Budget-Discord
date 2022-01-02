import React from 'react';
import PropTypes from 'prop-types';

export default function RightClickMenu({ open, children }) {
  return (
    <>
      {
        open
          ? (
            <div
              className="dropdown"
              style={{
                position: 'absolute', top: '58px', width: '300px', padding: '1rem', backgroundColor: 'var(--bg)', border: 'var(--border)', borderRadius: 'var(--border-radius)',
              }}
            >
              {children}
            </div>
          )
          : <></>
      }
    </>
  );
}

RightClickMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  // eslint-disable-next-line
  children: PropTypes.any.isRequired,
};
