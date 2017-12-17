import Expo, { Audio, Notifications } from 'expo'
import React from 'react'
import { Platform, StatusBar, StyleSheet, View, AsyncStorage, Linking, TouchableHighlight } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'

import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import registerForPushNotificationsAsync from './api/registerForPushNotificationsAsync'
import { Tabs } from './navigation/ReactNavRouter'

import cacheAssetsAsync from './utilities/cacheAssetsAsync'
import Auth from './components/Auth'

import { Auth0Config, GraphCoolConfig, ExpoConfig } from './config'
export const auth0_client_id = Auth0Config.clientId
export const authorize_url = Auth0Config.authorizeURI
export const graphQL_endpoint = GraphCoolConfig.endpoint

export const redirect_uri = Expo.Constants.manifest.xde
  ? ExpoConfig.redirectURI
  : `${Expo.Constants.linkingUri}/redirect`

// export let client
// AsyncStorage.getItem('token').then( encodedToken => {
//   console.log(encodedToken)
//   const httpLink = createHttpLink({ uri: graphQL_endpoint })
//   const middlewareLink = setContext(() => ({
//     headers: { 
//       authorization: `Bearer ${encodedToken}`,
//     }
//   }))
//   const link = middlewareLink.concat(httpLink)
//   client = new ApolloClient({
//     link: link,
//     dataIdFromObject: o => o.id,
//     cache: new InMemoryCache(),
//   })
//   }
// )

// const networkInterface = createNetworkInterface({ uri: graphQL_endpoint })

// networkInterface.use([{
//   applyMiddleware(req, next) {
//     if (!req.options.headers) req.options.headers = {}
//     AsyncStorage.getItem('token')
//       .then(encodedToken => {
//         console.log('encodedToken')
//         console.log(encodedToken)
//         req.options.headers['authorization'] = `Bearer ${encodedToken}`
//         next()
//       })
//       .catch(error => {
//         console.error('ERROR: ', error)
//         next()
//       })
//   }
// }])

const httpLink = createHttpLink({
  uri: graphQL_endpoint,
  // credentials: 'same-origin',
})

const cache = new InMemoryCache()

const middlewareLink = setContext(async (req, { headers }) => {
  // console.log('middleware token:') 
  // console.log(await AsyncStorage.getItem('token'))
  return {
    ...headers,
    headers: {
      authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
    },
  }
})

const link = middlewareLink.concat(httpLink)

export const client = new ApolloClient({
  link: link,
  cache: cache,
})

class AppContainer extends React.Component {

  state = {
    appIsReady: false,
  }

  componentWillMount() {
    this._loadAssetsAsync()
  }

  componentDidMount() {
    this._notificationSubscription = this._registerForPushNotifications();
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
    })
  }  

  _registerForPushNotifications() {
    // Send our push token over to our backend so we can receive notifications
    // You can comment the following line out if you want to stop receiving
    // a notification every time you open the app. Check out the source
    // for this function in api/registerForPushNotificationsAsync.js

    // registerForPushNotificationsAsync();

    // Watch for incoming notifications
    this._notificationSubscription = Notifications.addListener(
      this._handleNotification
    );
  }

  _handleNotification = ({ origin, data }) => {
    alert('Push notification ${origin} with data: ${JSON.stringify(data)}')
  }

  async _loadAssetsAsync() {
    try {
      await cacheAssetsAsync({
        images: [
          require('./assets/images/expo-wordmark.png'),
        ],
        fonts: [
          FontAwesome.font,
        ],
      })
    } catch (e) {
      console.warn(
        'There was an error caching assets (see: main.js), perhaps due to a ' +
          'network timeout, so we skipped caching. Reload the app to try again.'
      )
      console.log(e.message)
    } finally {
      this.setState({ appIsReady: true })
    }
  }

  render() {
    if (this.state.appIsReady) {
      return (
        <ApolloProvider client={client}>
          <Tabs onNavigationStateChange={null} />
        </ApolloProvider>
      )
    } else {
      return <Expo.AppLoading />
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  statusBarUnderlay: {
    height: 24,
    backgroundColor: '#0f02',
  },
})

Expo.registerRootComponent(AppContainer)