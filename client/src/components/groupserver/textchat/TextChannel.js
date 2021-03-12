import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useForm, Controller } from 'react-hook-form';

export default function TextChannel(props){
  const [input, setInput] = useState("");
  const { control, handleSubmit, errors, reset } = useForm();

  useEffect(async ()=>{
    //If the chat log for the text channel with the id "props.textChannelId"
    //doesn't exist in the client, then retrieve it from the server
    if (!props.chatLogs[props.textChannelId]){
      await fetch('/api/groupServer/get-chat-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem('Authorization')
        },
        body: JSON.stringify({
          type: 'get-chat-log',
          userId: props.user._id,
          textChannelId: props.textChannelId
        })
      })
        .then(response => { return response.json(); })
          .then((data) => {
            let chatLogs = {...props.chatLogs};
            chatLogs[props.textChannelId] = data.chatLog; 
            props.setChatLogs(chatLogs);
          });
    }
  }, [props.textChannelId]);

  function onSubmit(data, e){
    //Check whether input is not just an empty string
    if (data.message !== ""){
        //Create a message object
        const message = {
          content: data.message,
          index: Object.keys(props.chatLogs).length + 1,
          author: props.user.name,
          timestamp: new Date(),
          notSent: true
        }
        //Send the message object over to client
        props.chatLogs[props.textChannelId].push(message);
        //Send the message object over to the server
        props.sendMessage(message);
        //Clear chat box
        reset();
    }
  }

  //Displays messages
  //If a message is not "sent" then it will be displayed with a dark gray color
  //Otherwise, sent messages will be light gray
  function displayChat(){
    if (props.chatLogs[props.textChannelId]){
        return(
          <ScrollView style={styles.chatContainer}>
              {
                Object.entries(props.chatLogs[props.textChannelId]).map(([key, value]) => {
                  if (value.notSent){
                    return(
                      <View style={styles.messageContainer} key={key}>
                        <Text style={styles.unsentMessage}>
                          {value.author} ({new Date(value.timestamp).toLocaleString()}):<br />{value.content}
                        </Text>
                      </View>
                    );
                  }
                  else{
                    return(
                      <View style={styles.messageContainer} key={key}>
                        <Text style={styles.sentMessage}>
                          {value.author} ({new Date(value.timestamp).toLocaleString()}):<br />{value.content}
                        </Text>
                      </View>
                    );
                  }
                })
              }
          </ScrollView>
      );
    }
  };

  return (
    <View style={styles.container}>
      {displayChat()}
      <View style={styles.chatInputContainer}>
        <Controller 
          control={control}
          render={(props) => (
            <TextInput
              style={styles.chatInput}
              onChange={props.onChange}
              value={props.value}
              ref={props.ref}
              placeholder='Message'
              autoCapitalize='none'
              autoCorrect={false}
              onSubmitEditing={handleSubmit(onSubmit)}
            />
          )}
          name='message'
          rules={{minLength: 1, maxLength: 1000}}
          defaultValue=''
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#303030",
    flex: 1,
    minWidth: '500px'
  },
  chatContainer: {
    flexGrow: 1,
    height: '100%'
  },
  chatInput: {
    height: '40px',
    width: '95%',
    borderColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: '5px',
    paddingLeft: '5px',
    color: '#fff'
  },
  chatInputContainer: {
    width: '100%',
    minHeight: '65px',
    minWidth: '500px',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  messageContainer: {
    marginLeft: '5px',
    marginBottom: '5px',
    minHeight: '65px'
  },
  sentMessage: {
    color: '#c2c2c2'
  },
  unsentMessage: {
    color: '#858585'
  }
});

/*
DISPLAY
<div className="col-12" aria-orientation="vertical" style={{height: "100%", position: "absolute", overflowY: "scroll"}}>
{
  Object.entries(props.chatLogs[props.textChannelId]).map(([key, value]) => {
    if (value.notSent){
      return(
        <p className="ml-2 #858585" key={key}>
          {value.author} ({new Date(value.timestamp).toLocaleString()}):<br />{value.content}
        </p>
      );
    }
    else{
      return(
        <p className="ml-2" style={{color: "#c2c2c2"}} key={key}>
          {value.author} ({new Date(value.timestamp).toLocaleString()}):<br />{value.content}
        </p>
      );
    }
  })
}
</div>
*/

/*
<div className="col-10 align-self-end w-100" style={{minHeight: "100vh", background: "#303030"}}>
    {displayChat()}
    <form className="w-75 mb-2" style={{position: "absolute", bottom: "0"}}>
        <div className="form-row" >
            <div className="col">
                <input type="text" className="form-control " id="chatBox" value={input} onChange={handleChatBoxChange} />
            </div>
            <button type="submit" className="btn btn-primary" onClick={handleChatBoxSubmit}>Send</button>
        </div>
    </form>
</div>
*/