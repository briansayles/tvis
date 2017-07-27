import {graphql, compose} from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';
import {Text, View, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native';
import Expo from 'expo';
import jwtDecoder from 'jwt-decode';
import {redirect_uri, auth0_client_id, authorize_url, client} from '../main';
import {currentUserQuery, createUserMutation} from '../constants/GQL'

class Auth extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: undefined,
    };
  }

  componentDidMount() {
    Linking.addEventListener('url', this._handleAuth0Redirect);

    client.query({query: currentUserQuery}).then(
      result => {
        if (result.data.user) {
          this.setState({
            user: {
              name: result.data.user.name,
              id: result.data.user.id,
            }
          });
        }
      }
    );
  }

  componentWillReceiveProps(nextProps) {
  }

  _loginWithAuth0 = async () => {
    const redirectionURL = authorize_url + this._toQueryString({
        client_id: auth0_client_id,
        response_type: 'token',
        scope: 'openid name',
        redirect_uri,
        state: redirect_uri,
      });
    Expo.WebBrowser.openBrowserAsync(redirectionURL);
  }

  _logout = () => {
    AsyncStorage.clear();
    this.setState({
      ...this.state,
      user: undefined,
    });
  }

  _handleAuth0Redirect = async (event) => {
    if (!event.url.includes('+/redirect')) {
      return;
    }
    Expo.WebBrowser.dismissBrowser();
    const [, queryString] = event.url.split('#');
    const responseObj = queryString.split('&').reduce((map, pair) => {
      const [key, value] = pair.split('=')
      map[key] = value // eslint-disable-line
      return map
    }, {});
    const encodedToken = responseObj.id_token;
    const decodedToken = jwtDecoder(encodedToken);
    const username = decodedToken.name;
    AsyncStorage.setItem('token', encodedToken).then(
      result => {
        this.props.fetchCurrentUser.refetch().then(
          result => {
            if (result.data.user) {
              this.setState({
                user: {
                  name: result.data.user.name,
                  id: result.data.user.id,
                }
              });
            } else {
              this.props.createUser(
                {
                  variables:
                  {
                    encodedToken,
                    username,
                  }
                }
              ).then(
                result => {
                  this.setState({
                    user: {
                      name: result.data.createUser.name,
                      id: result.data.createUser.id,
                    }
                  });
                },
                failure => {
                  console.error('ERROR: could not create user: ', failure);
                }
              );
            }
          },
          failure => {
            console.error('ERROR: failed asking for current user: ', failure);
          }
        )
      },
      failure => {
        console.error('ERROR: could not store token in AsyncStorage');
      }
    );
  }

  _toQueryString(params) {
    return '?' + Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
  }

  render() {
    return (
      <View style={{flex: 1, paddingTop: 12}}>
        {this.state.user ? 
          <TouchableHighlight
            onPress={() => this._logout()}>
            <Text>
              SignOut {this.state.user.name}
            </Text>
          </TouchableHighlight>
        :
          <TouchableHighlight
            onPress={() => this._loginWithAuth0()}>
            <Text>
              Signin to get started
            </Text>
          </TouchableHighlight>
        }
      </View>
    );
  }
}

export default compose(
  graphql(currentUserQuery, { name: 'fetchCurrentUser' }),
  graphql(createUserMutation, { name: 'createUser' }),
)(Auth);