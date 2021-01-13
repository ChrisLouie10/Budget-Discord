import React from 'react';
import {Dialog, DialogTitle, DialogContent } from '@material-ui/core';

export default function Popup(props){
    const {title, children, openPopup, setOpenPopup, ...others} = props;

    const onEscapeKeyDown = () => {
        setOpenPopup(false);
    }

    return(
        <Dialog open={openPopup} maxWidth="md" onEscapeKeyDown={onEscapeKeyDown}>
            <DialogTitle>
                <div>Create New Server</div>
            </DialogTitle>
            <DialogContent>
                {React.cloneElement(children,{openPopup: openPopup, setOpenPopup: setOpenPopup, others: others})}
            </DialogContent>
        </Dialog>
    )
}