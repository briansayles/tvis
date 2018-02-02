import React from 'react'
import { graphql } from 'react-apollo'
import { ActivityIndicator, StyleSheet, Text, View, Button } from 'react-native'

import Auth, { logout } from '../components/Auth'
import {currentUserQuery} from '../constants/GQL'

const ProfileScreen = ({ fetchCurrentUser: { loading, user } }) => {
  if (loading) {
    return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
  }
  return (
    <View style={styles.container}>
      {user && <Text>Logged in as { user.name }</Text>}
      {user && <Text>You have { user.credits ? user.credits.toString() : '0' } credits.</Text>}
      {user && <Button onPress={logout} title='Logout' />}
      
      {!user && <Auth/>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default graphql(currentUserQuery, { name: 'fetchCurrentUser' })(ProfileScreen)