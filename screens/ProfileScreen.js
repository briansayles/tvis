import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import {client} from '../main';
import Auth from '../components/Auth'

const currentUserQuery = gql`
  query currentUser {
      user {
          id
          name
      }
  }
`

class ProfileScreen extends React.Component {
	render() {
		return(
      <View style={styles.container}>

    			<Auth />


			</View>
		)
	}
}

export default compose(
  graphql(currentUserQuery, { name: 'currentUser', }),
)(ProfileScreen)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 80,
  },
})