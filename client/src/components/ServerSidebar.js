import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from "react-router-dom";
import Actions from "./popups/Actions.js";

export default function ServersList(props){
    const [mounted, setMounted] = useState(true);
    const [groupServerName, setGroupServerName] = useState("Group Server");
    const [actionDialog, setActionDialog] = useState(0);
    const [openPopupActions, setOpenPopupActions] = useState(false);

    useEffect(()=>{
        return function cleanup(){
            setMounted(false);
        }
    }, []);

    useEffect(() => {
        if (props.groupServers){
            setGroupServerName(props.groupServers[props.groupServerId].name);
        }
    }, [props.groupServerId]);

    function handleRightClick(e){
        if (e.nativeEvent.which === 3 || e.type === "contextmenu"){
            e.preventDefault();
        }
    };

    function displayTextChannels(){
        if (props.groupServers[props.groupServerId]){ 
            return(
                Object.entries(props.groupServers[props.groupServerId].textChannels).map(([key, value]) => {
                    return(
                        <Text style={styles.option} key={key}>
                        {
                            props.textChannelId === key ?
                            <Link style={{color: "#b5fff3", textDecoration: 'none'}} onContextMenu={handleRightClick} to={{pathname: "/group/"+props.groupServerId+"/"+key}}>
                                {value.name}
                            </Link>
                            :
                            <Link style={{color: "#fff", textDecoration: 'none'}} onContextMenu={handleRightClick} to={{pathname: "/group/"+props.groupServerId+"/"+key}}>
                                {value.name}
                            </Link>
                        }
                        </Text>
                    )
                })
            )
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{groupServerName}</Text>
            </View>
            <View style={styles.textChannels}>
                <TouchableOpacity onPress={() => {if(!openPopupActions){setOpenPopupActions(true); setActionDialog(0);}}}>
                    <Text style={styles.option}>
                        Actions
                        <Actions
                            uri={props.uri}
                            mounted={mounted}
                            openPopup={openPopupActions}
                            setOpenPopup={setOpenPopupActions}
                            actionDialog={actionDialog}
                            setActionDialog={setActionDialog}
                            user = {props.user}
                            setUser = {props.setUser}
                            groupServerName = {groupServerName}
                            groupServers = {props.groupServers}
                            setGroupServers = {props.setGroupServers}
                            groupServerId = {props.groupServerId}
                            textChannelId = {props.textChannelId}
                        />
                    </Text>
                </TouchableOpacity>
                {displayTextChannels()}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: '5px',
        marginRight: '5px',
        marginTop: '10px',
        marginBottom: '10px',
        minWidth: '200px',
    },
    header: {
        alignItems: 'center'
    },
    option: {
        color: '#fff',
        paddingTop: '7px'
    },
    textChannels: {
        paddingLeft: '5px'
    },
    title: {
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold'
    }
});
/*
<nav id="server-side-bar">
    <div className="row">
        <h5 className="text-white">{groupServerName}</h5>
    </div>
    <div className="row">
        <ul className="list-unstyled text-white">
        <li onClick = {() => {if(!openPopupActions) {setOpenPopupActions(true); setActionDialog(0);}}}>
            <Link className="text-reset" to="#">Actions</Link>  
                <Actions
                    uri={props.uri}
                    mounted={mounted}
                    openPopup={openPopupActions}
                    setOpenPopup={setOpenPopupActions}
                    actionDialog={actionDialog}
                    setActionDialog={setActionDialog}
                    user = {props.user}
                    setUser = {props.setUser}
                    groupServerName = {groupServerName}
                    groupServers = {props.groupServers}
                    setGroupServers = {props.setGroupServers}
                    groupServerId = {props.groupServerId}
                    textChannelId = {props.textChannelId}
                    />
        </li>
        {displayTextChannels()}
        </ul>
    </div>
</nav>
*/