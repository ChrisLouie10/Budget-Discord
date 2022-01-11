import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { Context } from '../../contexts/Store';

export default function CreateServerForm({ setOpenPopup }) {
  const [state, setState] = useContext(Context);
  const [input, setInput] = useState(`${state.user.name}'s Server`);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      fetch('/api/groupServer/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'create',
          name: input,
          userId: state.user._id,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (data.success) {
            const currState = { ...state };
            const groupServers = { ...state.groupServers };
            groupServers[data.groupServerId] = data.groupServer;
            currState.groupServers = groupServers;
            setState(currState);
          } else console.log(data.message);
        });
    } finally {
      setLoading(false);
      setOpenPopup(false);
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value);
  }

  return (
    <form>
      <div className="form-group">
        <label htmlFor="createServerInput">Group Server Name</label>
        <input
          type="text"
          className="form-control"
          id="createServerInput"
          aria-describedby="serverInputHelp"
          value={input}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" disabled={loading} className="btn btn-primary" onClick={handleSubmit}>Create</button>
    </form>
  );
}

CreateServerForm.propTypes = {
  setOpenPopup: PropTypes.func.isRequired,
};
