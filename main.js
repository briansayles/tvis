import Expo, {Audio} from 'expo'
import React from 'react'
import { Platform, StatusBar, StyleSheet, View, AsyncStorage, Linking, TouchableHighlight } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import { ApolloProvider, graphql } from 'react-apollo'
import {SubscriptionClient, addGraphQLSubscriptions} from 'subscriptions-transport-ws'

import {Tabs} from './navigation/ReactNavRouter'

import cacheAssetsAsync from './utilities/cacheAssetsAsync'
import Auth from './components/Auth'

import {Auth0Config, GraphCoolConfig, ExpoConfig} from './config'
export const auth0_client_id = Auth0Config.clientId
export const authorize_url = Auth0Config.authorizeURI
export const graphQL_endpoint = GraphCoolConfig.endpoint

export let redirect_uri;
if (Expo.Constants.manifest.xde) {
  redirect_uri = ExpoConfig.redirectURI
} else {
  // this URL will be used when you publish your app
  redirect_uri = `${Expo.Constants.linkingUri}/redirect`
}

const networkInterface = createNetworkInterface({
  uri: graphQL_endpoint,
})

const wsClient = new SubscriptionClient(GraphCoolConfig.wsClient, GraphCoolConfig.wsClientOptions)

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

networkInterfaceWithSubscriptions.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {}
    }

    AsyncStorage.getItem('token').then(
      encodedToken => {
        req.options.headers['authorization'] = `Bearer ${encodedToken}`
        next()
      },
      failure => {
        console.error('ERROR: no token', failure)
        next()
      })
  }
}])

export const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  dataIdFromObject: o => o.id,
})

class AppContainer extends React.Component {

  state = {
    appIsReady: false,
  }

  componentWillMount() {
    this._loadAssetsAsync()
  }

  componentDidMount() {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
    })
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
          <Tabs/>
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