import React, { useState, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import ServersList from '../ServersList.js';
import Loading from './Loading';

// Component creating a private route
export default function PrivateRoute({ component: Component, ...rest}) {

  const [ user, setUser ] = useState();
  const [ success, setSuccess ] = useState(false);
  const [ loading, setLoading ] = useState(false);
  const [servers, setServers] = useState({});
  const [error, setError] = useState("");
  
  useEffect(async () => {
    let mounted = true;
    await fetch('http://localhost:3000/api/user/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem('Authorization')
      },
    }).then(response => { if(mounted) return response.json() })
      .then((data) => { 
        if(mounted){
          setUser(data.user);
          setSuccess(data.success);
        }
      }).catch(error => (mounted ? setSuccess(false): null));
    setLoading(true);
    return () => mounted = false;
  }, [])

  useEffect(async () => {
    if (user) await fetchServerListInfo();
  }, [user]);

  async function fetchServerListInfo(){
    await fetch('http://localhost:3000/api/groupServer/find', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('Authorization')
        },
        body: JSON.stringify({
            type: "find",
            userId: user._id
        })
    }).then(response => { return response.json(); })
        .then((data) => {
            if (!data.success) setError(data.message);
            else {
              setServers({...data.servers});  
            }       
        });
  }

  if(loading) return (
    <div className="container-fluid">
      <div className="row">
      <Route
        {...rest}
        render={(props) =>{
          return (success) ? 
          <>
            <div className="col-1" style={{minHeight: "100vh", background: "#212121"}}>
              <ServersList 
                user={user} 
                setUser={setUser} 
                serverId={rest.computedMatch.params.serverId}
                servers={servers}
                fetchServerListInfo={fetchServerListInfo}/>
            </div>
            <Component 
              {...rest} 
              user={user} 
              setUser={setUser} 
              servers={servers} 
              setServers={setServers}
              fetchServerListInfo={fetchServerListInfo}
              props={props}/> 
          </>
          : 
          <Redirect to="/login" />;
        }}
      ></Route>
      </div>
    </div>
  );
  else{
    return <Loading />
  }
}
