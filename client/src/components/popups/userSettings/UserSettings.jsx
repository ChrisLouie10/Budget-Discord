import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent } from '@material-ui/core';

export default function UserSettings({ openPopup, setOpenPopup }) {
  // function onEscapeKeyDown() {
  //   setOpenPopup(false);
  // }

  return (
    <>
    </>
    // <Dialog>
    //   <DialogContent fullScreen open={openPopup} onEscapeKeyDown={onEscapeKeyDown} />
    // </Dialog>
  );
}

UserSettings.propTypes = {
  openPopup: PropTypes.bool.isRequired,
  setOpenPopup: PropTypes.func.isRequired,
};
