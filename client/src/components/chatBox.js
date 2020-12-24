import React, { useState, useEffect } from 'react';

export default ChatBox = (props) => {
    const [input, setInput] = useState("");

    //When Enter key is pressed on the input,
    //the data is sent to ChatDisplay
    //and the input is cleared
    const handleEnterPress = (e) => {
        if (e.key == "Enter"){
            //Bubble up the new message to chatDisplay.jsx
            const timestamp = new Date();
            props.updateMessages(e.target.value, timestamp.toString());
            setInput("");
        }
    };

    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    return (  
        <input type="text" className="form-control m-2" id="chatBox" value={input} onChange={handleInputChange} onKeyPress={handleEnterPress}/>
    );
}