import { Notifications, AppLoading, registerRootComponent} from 'expo'
import { Audio } from 'expo-av'
import { AdMobRewarded, AdMobInterstitial } from 'expo-ads-admob'
import React from 'react'
import { YellowBox, Alert, Platform, StatusBar, StyleSheet, View, AsyncStorage, Linking, TouchableHighlight } from 'react-native'
import { ThemeProvider, } from 'react-native-elements'
import { theme } from './components/FormComponents'
import { FontAwesome, MaterialCommunityIcons, MaterialIcons, Ionicons} from '@expo/vector-icons'
import { setContext } from 'apollo-link-context'
// Apollo Client v3 (beta)
import { ApolloClient, ApolloProvider, createHttpLink, ApolloLink, HttpLink, InMemoryCache, from, split, execute, useQuery, useApolloClient, gql} from '@apollo/client'
import registerForPushNotificationsAsync from './api/registerForPushNotificationsAsync'
import Navigation from './navigation/ReactNavRouter'
import cacheAssetsAsync from './utilities/cacheAssetsAsync'
import { GraphCoolConfig } from './config'
export const graphQL_endpoint = GraphCoolConfig.endpoint

const httpLink = createHttpLink({
  uri: graphQL_endpoint,
});

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

class AppContainer extends React.Component {
  state = {
    appIsReady: false,
  }
  componentDidMount() {
    YellowBox.ignoreWarnings([
      "Warning: componentWillReceiveProps has been renamed",
      "Warning: componentWillMount has been renamed",
    ])
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
    this._loadAssetsAsync()

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

  _loadAssetsAsync() {
    try {
      cacheAssetsAsync({
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
    } finally {
      this.setState({ appIsReady: true })
    }
  }

  render() {
    if (this.state.appIsReady) {
      return (
        <ApolloProvider client={client}>
          <Navigation onNavigationStateChange={null} />
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