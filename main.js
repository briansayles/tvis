import { Notifications, AppLoading, registerRootComponent} from 'expo'
import { Audio } from 'expo-av'
import { AdMobRewarded, AdMobInterstitial } from 'expo-ads-admob'

import React from 'react'
import { Alert, Platform, StatusBar, StyleSheet, View, AsyncStorage, Linking, TouchableHighlight } from 'react-native'
import { ThemeProvider, } from 'react-native-elements'
import { theme } from './components/FormComponents'
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, Ionicons} from '@expo/vector-icons'
import { createHttpLink, HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import { ApolloClient } from 'apollo-client'
import { ApolloProvider, } from 'react-apollo'

import { getOperationAST } from 'graphql'
import { ApolloLink, concat, split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'

import { SubscriptionClient } from 'subscriptions-transport-ws'
import registerForPushNotificationsAsync from './api/registerForPushNotificationsAsync'
import AppNavContainer from './navigation/ReactNavRouter'

import cacheAssetsAsync from './utilities/cacheAssetsAsync'
import Auth from './components/Auth'

import { GraphCoolConfig } from './config'
export const graphQL_endpoint = GraphCoolConfig.endpoint
export const graphQL_subscription_endpoint = GraphCoolConfig.wsClient
export const graphQL_subscription_options = GraphCoolConfig.wsClientOptions


const httpLink = new HttpLink({ 
  uri: graphQL_endpoint,
  // credentials: 'same-origin',
});

const wsLink = new WebSocketLink(
  {
    uri: graphQL_subscription_endpoint,
    options: graphQL_subscription_options
  }
)

const link = ApolloLink.split(
  operation => {
    const operationAST = getOperationAST(operation.query, operation.operationName);
    return !!operationAST && operationAST.operation === 'subscription';
  },
  wsLink,
  httpLink
);

const middlewareLink = setContext(async (req, { headers }) => {
  return {
    ...headers,
    headers: {
      authorization: `Bearer ${await AsyncStorage.getItem('token')}`,
    },
  }
})

const cache = new InMemoryCache()

export const client = new ApolloClient({
  link: concat(middlewareLink, link),
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
    AdMobRewarded.addEventListener('rewardedVideoDidOpen', () => {
      console.log('rewarded video opened')
    })
    AdMobRewarded.addEventListener('rewardedVideoDidClose', () => {
      console.log('rewarded video closed')
    })
    AdMobRewarded.addEventListener('rewardedVideoDidLoad', () => {
      console.log('rewarded video loaded')
    })
    AdMobRewarded.addEventListener('rewardedVideoDidFailToLoad', () => {
      console.log('rewarded video failed to load')

    })
    AdMobRewarded.addEventListener('rewardedVideoDidRewardUser',
      (reward) => {
        console.log('user rewarded' + JSON.stringify(reward))   
      }
    )

    this._notificationSubscription = this._registerForPushNotifications();
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
      playThroughEarpieceAndroid: true,
      staysActiveInBackground: true,
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
          
        ],
        fonts: [
          FontAwesome.font,
          MaterialCommunityIcons.font,
          MaterialIcons.font,
          Ionicons.font,
        ],
      })
    } catch (e) {
      console.warn(e.message)
      console.log(e.message)
    } finally {
      this.setState({ appIsReady: true })
    }
  }

  render() {
    if (this.state.appIsReady) {
      return (
        <ApolloProvider client={client}>
            <AppNavContainer onNavigationStateChange={null} />
        </ApolloProvider>
      )
    } else {
      return <AppLoading />
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

registerRootComponent(AppContainer)