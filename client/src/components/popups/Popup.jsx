import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent } from '@material-ui/core';

export default function Popup({
  title, children, openPopup, setOpenPopup, ...others
}) {
  const closePopup = () => {
    setOpenPopup(false);
  };

  return (
    <Dialog open={openPopup} maxWidth="md" onEscapeKeyDown={closePopup}>
      <div className="pull-right">
        <button type="button" className="close" aria-label="Close" onClick={closePopup}>
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <DialogTitle>
        <div>{title}</div>
      </DialogTitle>
      <DialogContent>
        {React.cloneElement(children, { openPopup, setOpenPopup, others })}
      </DialogContent>
    </Dialog>
  );
}

// https://reactjs.org/docs/typechecking-with-proptypes.html
Popup.propTypes = {
  title: PropTypes.string.isRequired,
  // eslint-disable-next-line
  children: PropTypes.any.isRequired,
  openPopup: PropTypes.bool.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
};
