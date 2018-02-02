import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, FlatList} from 'react-native'
import {List, ListItem, Button, SearchBar, CheckBox} from 'react-native-elements'
import {currentUserQuery, addCreditsMutation, } from '../constants/GQL'
import { NewButton } from '../components/NewButton'
import Events from '../api/events'
import { BannerAd } from '../screens/Ads'
import { AdMobRewarded } from 'expo'
import { showRewardedAd } from '../main'

class ContactListScreen extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      refreshing: false,
      contacts: null,
      filteredContacts: null,
      checked: [],
    }
  }

  static navigationOptions = {

  }

  componentDidMount() {
    // this.refreshEvent = Events.subscribe('RefreshContactList', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      // if (nextProps.currentUserQuery.user !== this.state.user) {
        // this.props.currentUserTournamentsQuery.refetch()
      // }
      this.setState({user: nextProps.currentUserQuery.user || null})
    }
  }

  componentWillMount() {
    this._getContacts()
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  async _getContacts() {
    const { status } = await Expo.Permissions.getAsync(Expo.Permissions.CONTACTS)
    this.setState({contactsPermission: status})

    // Ask for permission to query contacts.
    const permission = await Expo.Permissions.askAsync(Expo.Permissions.CONTACTS)
    if (permission.status !== 'granted') {
      Alert.alert("Permission to access contacts was denied. This will limit the app's functionality") // Permission was denied...
      return
    }
    const contacts = await Expo.Contacts.getContactsAsync({
      fields: [
        Expo.Contacts.EMAILS,
      ],
      pageSize: 5000,
      pageOffset: 0,
    })
    if (contacts.total > 0) {
      const sortedContacts = contacts.data.sort((a,b) => a.lastName.localeCompare(b.lastName))
      this.setState({contacts: sortedContacts, filteredContacts: null})
    } else {
      Alert.alert("Unable to retrieve any contacts. Maybe you don't have any.")
    }
  }

  _refreshButtonPressed() {
    this._getContacts()
  }

  searchContacts(searchString) {
    if(searchString.length === 0) {
      this.setState({filteredContacts: null})
      return
    } else {
       const filteredValues = this.state.contacts.filter((currentValue) => {
        return currentValue.name.toLowerCase().includes(searchString.toLowerCase(), 0)
      })
      this.setState({filteredContacts: filteredValues})
    }
  }

  clearSearchBar() {
    this.setState({filteredContacts: null})
    return
  }

  render() {
    const { contacts, user, filteredContacts } = this.state

    if (!contacts) {
      if (this.state.contactsPermission == 'denied') {
        return (<Text>Permission to access contacts has been denied. To allow access, you will need to go to your device SETTINGS
          and manually enable access via the Privacy tab.
        </Text>)
      }
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else {
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <Text>{contacts.length} contacts loaded.</Text>
          <SearchBar
            lightTheme
            autoCorrect={false}
            onChangeText={this.searchContacts.bind(this)}
            onClearText={this.clearSearchBar.bind(this)}
            icon={{ type: 'font-awesome', name: 'search' }}
            placeholder='Type a name to search for...'
            clearIcon
          />
          <ScrollView 
            style={{flex: 1, marginLeft: 5, marginRight: 5}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._refreshButtonPressed.bind(this)}
              />
            }
          >
            <FlatList
              data={filteredContacts}
              renderItem={({item, index}) => 
                <CheckBox
                  key={item.id}
                  title={item.name + (item.emails[0] ? "(" + item.emails[0].email + ")" : "")}
                  onPress={() => this.state.checked[index] = !this.state.checked[index]}
                  checked={this.state.checked[index]}
                />
              }
            />
          </ScrollView>
          <BannerAd />
        </View>
      )
    }
  }

  _endRef = (element) => {
    this.endRef = element
  }
}

export default compose(
  graphql(currentUserQuery, { name: 'currentUserQuery' }),
  graphql(addCreditsMutation, {name: 'addCreditsMutation'}),
)(ContactListScreen)