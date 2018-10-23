import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, FlatList} from 'react-native'
import {List, ListItem, Button, SearchBar, CheckBox} from 'react-native-elements'
import {currentUserQuery, addCreditsMutation, getUserContactsQuery, } from '../constants/GQL'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import Expo, { AdMobRewarded, Contacts, Permissions, } from 'expo'
import { showRewardedAd } from '../main'

class ContactListScreen extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      refreshing: false,
      deviceContacts: null,
      filteredDeviceContacts: null,
      checked: [],
      contactsPermission: 'denied',
      filtering: false,
      query: "",
    }
  }

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshContactList', () => this._refresh())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      this.setState({user: nextProps.currentUserQuery.user || null})
    }
  }

  componentWillMount() {
    this._getDeviceContacts()
  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refresh() {
    this._getDeviceContacts()
  }

  _editButtonPressed(id) {
    alert('edit button pressed')
  }

  _deleteButtonPressed(id) {
    alert('delete button pressed')
  }

  async _getDeviceContacts() {
    const { status } = await Permissions.askAsync(Permissions.CONTACTS)
    this.setState({contactsPermission: status})
    if (status !== 'granted') {
      Alert.alert("Permission to access contacts was denied. This will limit the app's functionality") // Permission was denied...
      return
    }
    const { data } = await Contacts.getContactsAsync({ })
    if (data.length > 0) {
      this.setState({deviceContacts: data, filteredDeviceContacts: null})
    } else {
      Alert.alert("Unable to retrieve any data. Maybe you don't have any.")
    }
  }

  searchDeviceContacts(searchString) {
    if(searchString.length < 3) {
      this.setState({filteredDeviceContacts: null, filtering: false})
      return
    } else {
      this.setState({filtering: true})
      const filteredValues = this.state.deviceContacts.filter((currentValue) => {
        return currentValue.name.toLowerCase().includes(searchString.toLowerCase(), 0)
      }).sort((a,b) => a.name.localeCompare(b.name))
      this.setState({filteredDeviceContacts: filteredValues, filtering: false})
    }
  }

  handleQueryChange = query => {
    this.setState(state => ({ ...state, query: query || "" }))
    this.searchDeviceContacts(query)
  }
  handleSearchCancel = () => {
    this.handleQueryChange("")
    this.search.blur()
  }

  handleSearchClear = () => {
    this.handleQueryChange("")
    this.search.blur()
  }

  render() {
    const { loading, error, Contacts } = this.props.getUserContactsQuery

    if (loading || !this.state) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const { deviceContacts, user, filteredDeviceContacts } = this.state
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          {this.state.contactsPermission == 'denied' && 
            <Text>
              Permission to access this device\'s contacts has been denied, which limits the apps functionality. To allow access, you will need to go to your device SETTINGS and manually enable access via the Privacy tab.
            </Text>
          }
          {this.state.contactsPermission != 'denied'  &&
            <View>
              {deviceContacts && <Text style={{paddingLeft: 10, paddingTop: 5}}>
                {deviceContacts.length || 0} contacts loaded from device.
              </Text>}

              <SearchBar
                ref={search => this.search = search}
                lightTheme
                autoCorrect={false}
                icon={{ type: 'font-awesome', name: 'search' }}
                placeholder='Search device contacts for...'
                clearIcon
                showLoading={this.state.filtering}
                onChangeText={this.handleQueryChange}
                onCancel={this.handleSearchCancel}
                onClear={this.handleSearchClear}
                value={this.state.query}
              />
              <ScrollView 
                style={{marginLeft: 5, marginRight: 5}}
                refreshControl={
                  <RefreshControl
                    refreshing={this.state.refreshing}
                    onRefresh={this._refresh.bind(this)}
                  />
                }
              >
                <List>
                  {
                    filteredDeviceContacts && filteredDeviceContacts.map((item, i) => (
                      <Swipeout
                        key={i}
                        autoClose={true}
                        right={[
                          {
                            text: 'Edit',
                            onPress: this._editButtonPressed.bind(this, item.id),
                            type: 'primary',
                          },
                          {
                            text: 'DELETE',
                            onPress: this._deleteButtonPressed.bind(this, item.id),
                            backgroundColor: '#ff0000',
                            type: 'delete',
                          },
                        ]}
                      >
                        <ListItem
                          title={item.name}
                          onPress={this._editButtonPressed.bind(this, item.id)}
                        />
                      </Swipeout>
                    ))
                  }
                </List>
              </ScrollView>
            </View>
          }
          <BannerAd />
        </View>
      )
    }
  }
}

export default compose(
  graphql(currentUserQuery, { name: 'currentUserQuery' }),
  graphql(addCreditsMutation, {name: 'addCreditsMutation'}),
  graphql(getUserContactsQuery, {name: 'getUserContactsQuery'}),
)(ContactListScreen)