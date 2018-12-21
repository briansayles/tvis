import React from 'react'
import { graphql, compose, withApollo } from 'react-apollo'
import { ActivityIndicator, StyleSheet, Text, View, Button, AsyncStorage} from 'react-native'

import Auth from '../components/Auth'
import {currentUserQuery} from '../constants/GQL'

class ProfileScreen extends React.Component {
  
  constructor(props) {
    super(props)
  }

  _logout = async () => {
    await AsyncStorage.removeItem('token')
    const { client } = this.props
    client.resetStore()
  }
  
  render() {
    const {fetchCurrentUser: { loading, user }} = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    }
    return (
      <View style={styles.container}>
        {user && <Text>Logged in as { user.name }</Text>}
        {user && <Text>You have { user.credits ? user.credits.toString() : '0' } credits.</Text>}
        {user && <Button onPress={this._logout} title='Logout' />}
        
        {!user && <Auth/>}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default compose (
  graphql(currentUserQuery, { name: 'fetchCurrentUser' }),
  withApollo,
)(ProfileScreen)