import React, { Component } from 'react'
import { graphql, gql, compose } from 'react-apollo'
import { ActivityIndicator, Text, View, StyleSheet, Linking, AsyncStorage } from 'react-native'
import { Button } from 'react-native-elements'
import {AuthSession} from 'expo'
import jwtDecoder from 'jwt-decode'

import { redirect_uri, auth0_client_id, authorize_url, client } from '../main'

import {currentUserQuery, createUserMutation} from '../constants/GQL'
import Events from '../api/events'

export const logout = async () => {
  await AsyncStorage.removeItem('token')
  client.resetStore()
}

const toQueryString = params => {
  return '?' + Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

class Auth extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      loading: false,
    }
  }

  componentDidMount() {
  }

  loginWithAuth0 = async () => {
    this.setState({loading: true})
    const redirectUrl = Expo.AuthSession.getRedirectUrl();
    console.log(`Redirect URL (add this to Auth0): ${redirectUrl}`);
    const result = await Expo.AuthSession.startAsync({
      authUrl: authorize_url + toQueryString({
        client_id: auth0_client_id,
        response_type: 'token',
        scope: 'openid name',
        redirect_uri: redirectUrl,
      }),
    });

    console.log(result);
    if (result.type === 'success') {
      this.handleParams(result.params);
    }
  }

  handleParams = (responseObj) => {
    if (responseObj.error) {
      Alert.alert('Error', responseObj.error_description
        || 'something went wrong while logging in');
      return;
    }
    const encodedToken = responseObj.id_token;
    const decodedToken = jwtDecoder(encodedToken);
    const username = decodedToken.name;
    AsyncStorage.setItem('token', encodedToken)
      .then(() => {
        this.props.fetchCurrentUser.refetch()
          .then(result => {
            if (!result.data.user) {
              this.props.createUser({ variables: { encodedToken, username } })
                .catch(error => {
                  console.log('ERROR: could not create user: ', error)
                })
            }
            this.setState({loading: false})
          })
          .catch(error => {
            console.error('ERROR: failed asking for current user: ', error)
            this.setState({loading: false})
          })
      })
      .catch(error => {
        console.error('ERROR: could not store token in AsyncStorage')
        this.setState({loading: false})
      }
    )
  }

  render() {
    const loading = this.state && this.state.loading 
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else {
      return (
        <View style={[{flex: 1}, styles.container]}>
          <Button
            backgroundColor='green'
            onPress={this.loginWithAuth0}
            title={"SIGN IN or SIGN UP (FREE!)"}
          />
        </View>
      )
    }
  }
}

export default compose(
  graphql(createUserMutation, { name: 'createUser' }),
  graphql(currentUserQuery, { name: 'fetchCurrentUser' })
)(Auth)

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})