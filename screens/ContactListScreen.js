import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, FlatList} from 'react-native'
import {List, ListItem, Button, SearchBar, CheckBox} from 'react-native-elements'
import {currentUserQuery, addCreditsMutation, getUserContactsQuery, } from '../constants/GQL'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { AdMobRewarded } from 'expo'
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
    }
  }

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshContactList', () => this._refresh())
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
    this._getDeviceContacts()
  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refresh() {
    this._getDeviceContacts()
  }

  // _addButtonPressed() {
  //   this.setState({loading: true})
  //   this.props.createItem(
  //     {
  //       variables:
  //       {
  //         "tournamentId": this.props.getData.Tournament.id,
  //         "costType": "Buyin",
  //         "price": 20,
  //         "chipStack": 1000,
  //       }
  //     }
  //   ).then((result) => {
  //     Events.publish('RefreshCostList')
  //     this._editButtonPressed(result.data.createCost.id)
  //   })
  // }

  _editButtonPressed(id) {
    alert('edit button pressed')
    // this.props.navigation.navigate('CostEdit', {id: id})
  }

  _deleteButtonPressed(id) {
    alert('delete button pressed')
    // this.setState({loading: true})
    // this.props.deleteItem({variables: {id: id} }).then(
    //   () => Events.publish('RefreshCostList')
    // )
  }

  async _getDeviceContacts() {
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
      this.setState({deviceContacts: sortedContacts, filteredDeviceContacts: null})
    } else {
      Alert.alert("Unable to retrieve any contacts. Maybe you don't have any.")
    }
  }

  searchDeviceContacts(searchString) {
    if(searchString.length === 0) {
      this.setState({filteredDeviceContacts: null})
      return
    } else {
      const filteredValues = this.state.deviceContacts.filter((currentValue) => {
        return currentValue.name.toLowerCase().includes(searchString.toLowerCase(), 0)
      })
      this.setState({filteredDeviceContacts: filteredValues})
    }
  }

  clearSearchBar() {
    this.setState({filteredDeviceContacts: null})
    return
  }

  render() {
    const { deviceContacts, user, filteredDeviceContacts } = this.state
    const { loading, error, Contacts } = this.props.getUserContactsQuery

    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          {this.state.deviceContactsPermission == 'denied' && 
            <Text>
              Permission to access this device\'s contacts has been denied. To allow access, you will need to go to your device SETTINGS and manually enable access via the Privacy tab.
            </Text>
          }
          {this.state.deviceContactsPermission != 'denied'  &&
            <View>
              <Text style={{paddingLeft: 10, paddingTop: 5}}>
                {deviceContacts.length || 0} contacts loaded from device.
              </Text>

              <SearchBar
                lightTheme
                autoCorrect={false}
                onChangeText={this.searchDeviceContacts.bind(this)}
                onClearText={this.clearSearchBar.bind(this)}
                icon={{ type: 'font-awesome', name: 'search' }}
                placeholder='Search device contacts for...'
                clearIcon
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
                    deviceContacts && deviceContacts.map((item, i) => (
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
                          title={item.name + (item.emails[0] ? "(" + item.emails[0].email + ")" : "")}
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