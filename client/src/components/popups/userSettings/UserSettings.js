import React, {useState, useEffect} from 'react';
import {Dialog, DialogContent } from '@material-ui/core';

export default function UserSettings(props){

    const {openPopup, setOpenPopup, ...others} = props;

    function onEscapeKeyDown(){
        setOpenPopup(false);
    }

    return(
        <Dialog>
            <DialogContent fullScreen open={openPopup} onEscapeKeyDown={onEscapeKeyDown}>

            </DialogContent>
        </Dialog>
    );
}