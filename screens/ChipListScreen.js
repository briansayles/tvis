import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, } from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getTournamentChipsQuery} from '../constants/GQL'
import { sortSegments, sortChips } from '../utilities/functions'
import Events from '../api/events'

class ChipListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formData: {},
      refreshing: false,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshChipList', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getTournamentChipsQuery) {
      this.setState({formData: nextProps.getTournamentChipsQuery})
      console.log('getTournamentChips props received' + JSON.stringify(this.state.formData))
    }
  }
  
  componentDidUpdate(prevProps) {

  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refreshButtonPressed() {
    this.props.getTournamentChipsQuery.refetch()
    // alert('Editor refreshed')
  }
  _navigateToChipEdit(id) {
    this.props.navigation.navigate('ChipEdit', {id: id})
  }
  render() {
    const { getTournamentChipsQuery: { loading, error, Tournament } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const chips = sortChips(Tournament.chips)
      return (
        <ScrollView style={{flex: 1, paddingTop: 22, paddingBottom: 30}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._refreshButtonPressed.bind(this)}
            />
          }
        >
          <List>
            {
              chips.map((item, i) => (
                <ListItem
                  key={i}
                  titleStyle={{backgroundColor: item.color, borderWidth: 2, borderColor: item.rimColor, color: item.textColor, width: 50, textAlign: 'center', borderRadius: 1000}}
                  title={item.denom}
                  onPress={this._navigateToChipEdit.bind(this, item.id)}
                />
              ))
            }
          </List>
          <Text>{"\n"}</Text>
        </ScrollView>
      )
    }
  }
}

export default compose(
  graphql(getTournamentChipsQuery, { name: 'getTournamentChipsQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(ChipListScreen)