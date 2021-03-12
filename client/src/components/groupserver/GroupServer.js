import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'react-router-dom';
import TextChannel from './textchat/TextChannel.js';
import ServerSidebar from '../ServerSidebar.js';

export default function GroupServer(props){
    
    const [mounted, setMounted] = useState(true);
    const [loading, setLoading] = useState(true);
    const [userAccess, setUserAccess] = useState(false);

    useEffect(async () => {
        return function cleanup(){
            setMounted(false);
        }
    }, []);

    //Upon intialization, verify that the user is authorized to be in the group server
    //If the user is not authorized, userAccess = false which redirects the user to "/dashboard"
    useEffect(async ()=>{
        if (props.user){
            try{
                await fetch('/api/groupServer/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem('Authorization')
                    },
                    body: JSON.stringify({
                        type: 'verify',
                        userId: props.user._id,
                        groupServerId: props.computedMatch.params.groupServerId,
                        textChannelId: props.computedMatch.params.textChannelId ? 
                                        props.computedMatch.params.textChannelId : 
                                        Object.keys(props.groupServers[props.computedMatch.params.groupServerId].textChannels)[0]
                    })
                }).then(response => { return response.json(); })
                    .then(async (data) => {
                        if (mounted) {
                            setUserAccess(data.access);
                        }
                    })
            } finally{
                if (mounted) setLoading(false);
            }
        }
        else setUserAccess(false);
    }, [props.computedMatch.params.groupServerId]);

    function sendMessage(message){
        const groupServerId = props.computedMatch.params.groupServerId;
        const textChannelId = props.computedMatch.params.textChannelId ? 
                                props.computedMatch.params.textChannelId : Object.keys(props.groupServers[groupServerId].textChannels)[0];

        //Send message over to server
        props.sendMessage(message, groupServerId, textChannelId);
    }

    return(
       <>
           {
               loading ?
               <Text>Loading</Text>
               :
                ((userAccess) ? 
                (
                    <>
                        <View style={styles.channelsContainer}>
                            <ServerSidebar 
                                uri={props.uri}
                                user={props.user} 
                                setUser={props.setUser} 
                                groupServers={props.groupServers} 
                                setGroupServers={props.setGroupServers}
                                groupServerId={props.computedMatch.params.groupServerId}
                                textChannelId={props.computedMatch.params.textChannelId ? 
                                            props.computedMatch.params.textChannelId : Object.keys(props.groupServers[props.computedMatch.params.groupServerId].textChannels)[0]}
                            />
                        </View>
                        <View style={styles.mainContentContainer}>
                            <TextChannel 
                                sendMessage={sendMessage} 
                                chatLogs={props.chatLogs} 
                                setChatLogs={props.setChatLogs}
                                textChannelId={props.computedMatch.params.textChannelId ? 
                                                props.computedMatch.params.textChannelId : Object.keys(props.groupServers[props.computedMatch.params.groupServerId].textChannels)[0]}
                                user={props.user}
                            /> 
                        </View>
                    </>
                )
                :
                <Redirect to="/dashboard" />)
           }
       </>
    );
}

const styles = StyleSheet.create({
    mainContentContainer: {
        flexGrow: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
        height: '100%'
    },
    channelsContainer: {
        backgroundColor: '#292929',
        flexDirection: 'column',
        height: '100%',
    }
});