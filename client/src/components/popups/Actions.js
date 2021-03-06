import React from 'react';
import {Dialog, DialogTitle, DialogContent } from '@material-ui/core';
import InviteForm from './InviteForm.js';
import CreateChannelForm from "./CreateChannelForm.js";
import DeleteChannelForm from "./DeleteChannelForm.js";
import DeleteGroupServerForm from "./DeleteGroupServerForm.js";
import LeaveGroupServerForm from "./LeaveGroupServerForm.js";

export default function Actions(props){
    const {openPopup, setOpenPopup} = props;

    function onEscapeKeyDown(){
        setOpenPopup(false);
    }

    function displayContents(){
        if (props.actionDialog === 0){
            return(
                <>
                    <DialogTitle>
                        <div>{"Actions"}</div>
                    </DialogTitle>
                    <DialogContent>
                        <ul className="list-unstyled">
                        {
                            (props.groupServers[props.groupServerId].owner ||
                            props.groupServers[props.groupServerId].admin) ?
                            <>
                                <li onClick = {() => props.setActionDialog(1)}>
                                    <a className="text-reset" role="button">Invite</a>
                                </li>
                                <li onClick = {() => props.setActionDialog(2)}>
                                    <a className="text-reset" role="button">Create Channel</a>
                                </li>
                                <li onClick = {() => props.setActionDialog(3)}>
                                    <a className="text-reset" role="button">Delete Current Channel</a>
                                </li>
                                <li onClick = {() => props.setActionDialog(4)}>
                                    <a className="text-reset" role="button">Delete Group Server</a>
                                </li>
                            </>
                            : <></>
                        }
                        {
                            (!props.groupServers[props.groupServerId].owner) ?
                            <>
                                <li onClick = {() => props.setActionDialog(5)}>
                                    <a className="text-reset" role="button">Leave Group Server</a>
                                </li>
                            </>
                            : <></>
                        }
                        </ul>
                    </DialogContent>
                </>
            )
        }
        else if (props.actionDialog === 1){
            return(
                <>
                    <DialogTitle>
                        <div>Invite</div>
                    </DialogTitle>
                    <DialogContent>
                        <InviteForm
                            uri={props.uri}
                            userId={props.user._id}
                            groupServers={props.groupServers}
                            setGroupServers={props.setGroupServers}
                            groupServerId={props.groupServerId}
                        />
                    </DialogContent>
                </>
            );
        }
        else if (props.actionDialog === 2){
            return(
                <>
                    <DialogTitle>
                        <div>Create Channel</div>
                    </DialogTitle>
                    <DialogContent>
                        <CreateChannelForm
                            userId={props.user._id}
                            groupServerId={props.groupServerId}
                            groupServers={props.groupServers}
                            setGroupServers={props.setGroupServers}
                            setOpenPopup={props.setOpenPopup}
                        />
                    </DialogContent>
                </>
            );
        }
        else if (props.actionDialog === 3){
            return(
                <>
                    <DialogTitle>
                        <div>Delete Current Channel</div>
                    </DialogTitle>
                    <DialogContent>
                        <DeleteChannelForm
                            userId={props.user._id}
                            textChannelId={props.textChannelId}
                            groupServerId={props.groupServerId}
                            groupServers={props.groupServers}
                            setGroupServers={props.setGroupServers}
                        />
                    </DialogContent>
                </>
            );
        }
        else if (props.actionDialog === 4){
            return(
                <>
                    <DialogTitle>
                        <div>Delete Group Server</div>
                    </DialogTitle>
                    <DialogContent>
                        <DeleteGroupServerForm
                            userId={props.user._id}
                            groupServers={props.groupServers}
                            setGroupServers={props.setGroupServers}
                            groupServerId={props.groupServerId}
                            groupServerName={props.groupServerName}
                        />
                    </DialogContent>
                </>
            );
        }
        else if (props.actionDialog === 5){
            return(
                <>
                    <DialogTitle>
                            <div>Leave {props.groupServerName}</div>
                    </DialogTitle>
                    <DialogContent>
                        <LeaveGroupServerForm
                            userId={props.user._id}
                            setUser={props.setUser}
                            groupServers={props.groupServers}
                            setGroupServers={props.setGroupServers}
                            groupServerId={props.groupServerId}
                            groupServerName={props.groupServerName}
                            setOpenPopup={props.setOpenPopup}
                        />
                    </DialogContent>
                </> 
            );
        }
    }

    return(
        <Dialog open={openPopup} maxWidth="md" onEscapeKeyDown={onEscapeKeyDown}>
            {displayContents()}
        </Dialog>    
    );
};