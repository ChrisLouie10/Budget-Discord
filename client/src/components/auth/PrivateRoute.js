import React, { useState, useEffect } from 'react';
import { Redirect, Route } from 'react-router-dom';
import Loading from './Loading';

// Component creating a private route
export default function PrivateRoute({ component: Component, ...rest}) {
  const [ user, setUser ] = useState();
  const [ success, setSuccess ] = useState();
  const [ loading, setLoading ] = useState(false);
  
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

  if(loading) return (
    <>
      <Route
        {...rest}
        render={(props) =>{
          return success ? <Component {...rest} user={user} props={props} /> : <Redirect to="/login" />;
        }}
      ></Route>
    </>
  );
  else{
    return <Loading />
  }
}
