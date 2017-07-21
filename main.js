import Expo from 'expo';
import React from 'react';
import { Platform, StatusBar, StyleSheet, View, AsyncStorage, Linking, TouchableHighlight } from 'react-native';
import { NavigationProvider, StackNavigation } from '@expo/ex-navigation';
import { FontAwesome } from '@expo/vector-icons';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { ApolloProvider, graphql } from 'react-apollo';
import {SubscriptionClient, addGraphQLSubscriptions} from 'subscriptions-transport-ws';

import Router from './navigation/Router';
import cacheAssetsAsync from './utilities/cacheAssetsAsync';
import Auth from './components/Auth';

export const auth0_client_id = 'oLIFR3lBUMNljIfO8sCTjvasle4txNMt';
export const authorize_url = 'https://tourneymanager.auth0.com/authorize';
export const graphQL_endpoint = 'https://api.graph.cool/simple/v1/cj2af1mob3rg50199waj6qzyf';

export let redirect_uri;
if (Expo.Constants.manifest.xde) {
  redirect_uri = 'exp://wy-8me.tourneymanager.tvis.exp.direct/+/redirect';
} else {
  // this URL will be used when you publish your app
  redirect_uri = `${Expo.Constants.linkingUri}/redirect`;
}

const networkInterface = createNetworkInterface({
  uri: graphQL_endpoint,
});

const wsClient = new SubscriptionClient(`wss://subscriptions.graph.cool/v1/cj2af1mob3rg50199waj6qzyf`, {
  reconnect: true,
  connectionParams: {
  }
});

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
);

networkInterfaceWithSubscriptions.use([{
  applyMiddleware(req, next) {
    if (!req.options.headers) {
      req.options.headers = {};  // Create the header object if needed.
    }

    AsyncStorage.getItem('token').then(
      encodedToken => {
        req.options.headers['authorization'] = `Bearer ${encodedToken}`;
        next();
      },
      failure => {
        console.error('ERROR: no token', failure);
        next();
      });
  }
}]);

export const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  dataIdFromObject: o => o.id,
});

class AppContainer extends React.Component {

  state = {
    appIsReady: false,
  };

  componentWillMount() {
    this._loadAssetsAsync();
  }

  componentDidMount() {
  }  

  async _loadAssetsAsync() {
    try {
      await cacheAssetsAsync({
        images: [require('./assets/images/expo-wordmark.png')],
        fonts: [
          FontAwesome.font,
        ],
      });
    } catch (e) {
      console.warn(
        'There was an error caching assets (see: main.js), perhaps due to a ' +
          'network timeout, so we skipped caching. Reload the app to try again.'
      );
      console.log(e.message);
    } finally {
      this.setState({ appIsReady: true });
    }
  }

  render() {
    if (this.state.appIsReady) {
      return (
      <ApolloProvider client={client}>
        <View style={styles.container}>
          <NavigationProvider router={Router}>
            <StackNavigation
              id="root"
              initialRoute={Router.getRoute('rootNavigation')}
              defaultRouteConfig={{
                navigationBar: {
                  title: 'TourneyVision',
                  backgroundColor: '#080b',
                  tintColor: '#005f',
                  renderRight: () => <Auth/>,
                }
              }}
            />
          </NavigationProvider>
          {Platform.OS === 'ios' && <StatusBar barStyle="default" />}
          {Platform.OS === 'android' &&
            <View style={styles.statusBarUnderlay} />}
        </View>
      </ApolloProvider>
      );
    } else {
      return <Expo.AppLoading />;
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
});

Expo.registerRootComponent(AppContainer);