import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, useHistory } from "react-router-dom";
// Simple private account information.

export default function Dashboard(props) {

  const [error, setError] = useState("");
  const history = useHistory();

  async function handleLogout(){
    setError('');

    await fetch('/api/user/logout', {
      method: 'DELETE',
      headers: {
        'Authorization': localStorage.getItem('Authorization')
      }
    }).then(response => { return response.json()})
      .then(data => {
      if(!data.success) setError(response.statusText);
      else{
        localStorage.removeItem('Authorization');
        history.push('/login');
      }
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileForm}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Profile</Text>
        </View>
        <View style={styles.mainContent}>
          <Text style={styles.main}><strong>Name:</strong> {props.user.name} #{props.user.number_id}</Text>
          <Text style={styles.main}><strong>Email:</strong> {props.user.email}</Text>
        </View>
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.button} >
            <Text style={styles.buttonText}><Link style={{color: '#fff', textDecoration: 'none'}} to='/change-name'>Change Name</Link></Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} >
            <Text style={styles.buttonText}><Link style={{color: '#fff', textDecoration: 'none'}} to='/change-password'>Change Password</Link></Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dangerButton} >
            <Text style={styles.buttonText}><Link style={{color: '#fff', textDecoration: 'none'}} to='/delete-account'>Delete Account</Link></Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={styles.logout}>Log Out</Text>
      </TouchableOpacity>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh'
  },
  bottomSection: {
    flex: .6,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    marginLeft: '5%',
    marginRight: '5%'
  },
  button: {
    alignItems: 'center',
    backgroundColor: '#009dff',
    borderColor: '#009dff',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: '0.25rem',
    justifyContent: 'center',
    height: '3rem',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  },
  dangerButton: {
    alignItems: 'center',
    backgroundColor: '#de0000',
    borderColor: '#de0000',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: '0.25rem',
    justifyContent: 'center',
    height: '3rem',
    paddingLeft: '1rem',
    paddingRight: '1rem'
  },
  buttonText: {
    fontSize: '1rem',
    color: '#fff'
  },
  profileForm: {
    width: '25rem',
    height: '21rem',
    borderColor: '#dbdbdb',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: '.25rem',
    marginBottom: '1rem'
  },
  header: {
    flex: .2,
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: '2rem'
  },
  logout: {
    color: '#009dff',
    fontSize: '1rem'
  },
  main: {
    fontSize: '1.1rem'
  },
  mainContent: {
    flex: .2,
    alignItems: 'flex-start',
    justifyContent: 'center',
    marginLeft: '5%'
  }
});