import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { UserContext } from '../../contexts/user-context';
import { GroupServersContext } from '../../contexts/groupServers-context';

export default function CreateServerForm({ setOpenPopup }) {
  const [user, setUser] = useContext(UserContext);
  const [groupServers, setGroupServers] = useContext(GroupServersContext);
  const [input, setInput] = useState(`${user.name}'s Server`);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await fetch('/api/group-servers/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: input,
          userId: user._id,
        }),
      }).then(async (response) => {
        const data = await response.json();
        if (response.status === 200) {
          const _groupServers = { ...groupServers };
          _groupServers[data.groupServerId] = data.groupServer;
          setGroupServers(_groupServers);
        } else console.error(data.message);
      });
    } catch (err) {
      console.error(err);
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
  setOpenPopup: PropTypes.func,
};

CreateServerForm.defaultProps = {
  setOpenPopup: () => {
    console.log('No function provided for Create Server Form');
  },
};
