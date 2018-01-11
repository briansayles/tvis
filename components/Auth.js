import React, { Component } from 'react'
import { graphql, gql, compose } from 'react-apollo'
import { Text, View, StyleSheet, Linking, AsyncStorage } from 'react-native'
import { Button } from 'react-native-elements'
import Expo from 'expo'
import jwtDecoder from 'jwt-decode'

import { redirect_uri, auth0_client_id, authorize_url, client } from '../main'

import {currentUserQuery, createUserMutation} from '../constants/GQL'
import Events from '../api/events'

export const logout = async () => {
  await AsyncStorage.removeItem('token')
    .then(() => {
      client.resetStore()
      // alert('logged out')
      this.props.fetchCurrentUser.refetch()     
    })
}

const toQueryString = params => {
  return '?' + Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}


class Auth extends Component {

  componentDidMount() {
    // handle redirects after auth0 authentication
    Linking.addEventListener('url', this.handleAuth0Redirect)
    Linking.getInitialURL().then(url => this.handleAuth0RedirectUrl(url))
  }

  loginWithAuth0 = async () => {
    const redirectionURL = authorize_url + toQueryString({
        client_id: auth0_client_id,
        response_type: 'token',
        scope: 'openid name',
        redirect_uri,
        state: redirect_uri,
      })
    Expo.WebBrowser.openBrowserAsync(redirectionURL)
  }

  handleAuth0Redirect = async (event) => {
    if (!event.url.includes('+/redirect')) return
    Expo.WebBrowser.dismissBrowser();
    this.handleAuth0RedirectUrl(event.url)
  }

  handleAuth0RedirectUrl = async (url) => {
    if (!url.includes('+/redirect')) return
    const [, queryString] = url.split('#')
    const responseObj = queryString.split('&').reduce((map, pair) => {
      const [key, value] = pair.split('=')
      map[key] = value
      return map
    }, {})
    const encodedToken = responseObj.id_token
    const decodedToken = jwtDecoder(encodedToken)
    const username = decodedToken.name
    // console.log('redirect. encodedToken:')
    // console.log(encodedToken)
    AsyncStorage.setItem('token', encodedToken)
      .then(() => {
        // console.log('stored token (we think!)')
        this.props.fetchCurrentUser.refetch()
          .then(result => {
            console.log('result')
            console.log(result)
            if (!result.data.user) {
              this.props.createUser({ variables: { encodedToken, username } })
                .catch(error => {
                  console.log('ERROR: could not create user: ', error)
                })
            }
          })
          .catch(error => {
            console.error('ERROR: failed asking for current user: ', error)
          })
      })
      .catch(error => {
        console.error('ERROR: could not store token in AsyncStorage')
      }
    )
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          buttonStyle={{textAlign: 'center'}}
          backgroundColor='green'
          onPress={this.loginWithAuth0}
          title={"SIGN IN or SIGN UP (FREE!)"}
        />
      </View>
    )
  }

}


export default compose(
  graphql(createUserMutation, { name: 'createUser' }),
  graphql(currentUserQuery, { name: 'fetchCurrentUser' })
)(Auth)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})