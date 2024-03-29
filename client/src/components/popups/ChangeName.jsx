import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

// // Simple Update Profile page

export default function ChangeName() {
  const nameRef = useRef();
  const passwordRef = useRef();
  const [error, setError] = useState();
  const [loading, setLoading] = useState();
  const history = useHistory();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      await fetch('/api/user/name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameRef.current.value,
          password: passwordRef.current.value,
        }),
      }).then((response) => response.json())
        .then((data) => {
          if (!data.success) setError(data.message);
          else history.push('/friends');
        });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="col-11 my-auto">
      <div className="card mx-auto" style={{ maxWidth: '400px' }}>
        <div className="card-body">
          <div className="card-header text-center mb-4">
            <h2>Change Name</h2>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3" id="old-password">
              <label htmlFor="input-old-password">Name</label>
              <input className="form-control" type="name" id="input-name" ref={nameRef} required />
            </div>
            <div className="mb-3" id="password">
              <label htmlFor="input-password">Password</label>
              <input className="form-control" type="password" id="input-password" ref={passwordRef} required />
            </div>
            <button disabled={loading} className="btn btn-primary w-5" type="submit">Update</button>
          </form>
        </div>
      </div>
    </div>
  );
}
