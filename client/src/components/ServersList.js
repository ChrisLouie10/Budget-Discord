import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link } from "react-router-dom";
import Popup from "./popups/Popup.js";
import CreateServerForm from "./popups/CreateServerForm.js";

export default function ServersList(props){
    const [openPopupCreate, setOpenPopupCreate] = useState(false);

    //Displays the group servers the user is a member of
    //Group Server name will be highlighted "#b5fff3" if the user is in that group server page
    function displayServers(){
        if (props.groupServers){
            return(
                Object.entries(props.groupServers).map(([key,value]) => {
                    if (value){
                        const textChannelId = Object.keys(value.textChannels)[0];
                        return(
                            <Text style={styles.option} key={key}>
                                {
                                props.groupServerId === key ?
                                <Link onClick={(e) => e.preventDefault()} style={{color: "#b5fff3", textDecoration: 'none'}} to={{pathname: "/group/"+key+"/"+textChannelId}} >
                                    {value.name}
                                </Link>
                                :
                                <Link style={{color: "#fff", textDecoration: 'none'}} to={{pathname: "/group/"+key+"/"+textChannelId}} >
                                    {value.name}
                                </Link>
                                }
                            </Text>
                        )
                    }
                })   
            );
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Budget Discord</Text>
            </View>
            <View style={styles.serverList}>
                <Text style={styles.option}>
                    <Link style={{color: "#fff", textDecoration: 'none'}} to='/dashboard'>Dashboard</Link>
                </Text>
                <Text style={styles.option}>
                    <Link style={{color: "#fff", textDecoration: 'none'}} to='/friends'>Friends</Link>
                </Text>
                {displayServers()}
                <TouchableOpacity onPress={() => {if (!openPopupCreate) setOpenPopupCreate(true)}}>
                    <Text style={styles.option}>
                        <Link style={{color: "#fff", textDecoration: 'none'}} to='#'>Create Server</Link>
                        <Popup
                            title={"Create New Server"}
                            openPopup = {openPopupCreate}
                            setOpenPopup = {setOpenPopupCreate}
                        >
                            <CreateServerForm 
                                user={props.user}
                                groupServers = {props.groupServers}
                                setGroupServers = {props.setGroupServers}
                            />
                        </Popup>
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: '15px',
        marginRight: '15px',
        marginTop: '15px',
        marginBottom: '15px',
        width: '120px'
    },
    option: {
        paddingTop: '7px'
    },
    serverList: {
        paddingLeft: '15px'
    },
    header: {
        alignItems: 'center'
    },
    title: {
        color: '#fff',
        fontSize: '16px',
        fontWeight: 'bold'
    },
    
});
/*
<div className="wrapper w-100">
    <nav id="sidebar">
        <div>
            <h5 className="text-white">Budget-Discord</h5>
        </div>

        <ul className="list-unstyled text-white">
            <li>
                <Link className="text-reset" to="/dashboard">Dashboard</Link>
            </li>
            <li>
                <Link className="text-reset" to="/friends">Friends</Link>
            </li>
            {displayServers()}
            <li onClick = {() => {if(!openPopupCreate) setOpenPopupCreate(true)}}>
            <Link className="text-reset" to="#">Create Server</Link>
                <Popup
                title={"Create New Server"}
                openPopup = {openPopupCreate}
                setOpenPopup = {setOpenPopupCreate}
                >
                    <CreateServerForm 
                    user={props.user}
                    groupServers = {props.groupServers}
                    setGroupServers = {props.setGroupServers}
                    />
                </Popup>
            </li>
        </ul>
    </nav>
</div>
*/