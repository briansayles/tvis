import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage, } from 'react-native'
import { List, ListItem, Avatar, Button, Card, PricingCard} from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getTournamentChipsQuery, createTournamentChipMutation, } from '../constants/GQL'
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
    if (nextProps.currentUserQuery) {
      const user = nextProps.currentUserQuery.user || null
      this.setState({user: user})
    }
    if (nextProps.getTournamentChipsQuery) {
      this.setState({formData: nextProps.getTournamentChipsQuery})
    }
  }
  
  componentDidUpdate(prevProps) {

  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refreshButtonPressed() {
    this.props.getTournamentChipsQuery.refetch()
  }

  _addButtonPressed(location, existingChip) {
    this.props.createTournamentChipMutation(
      {
        variables:
        {
          "tournamentId": this.props.getTournamentChipsQuery.Tournament.id,
          "denom": 500,
          "color": "#",
          "textColor": "#888",
          "rimColor": "#f00"
        }
      }
    ).then(() => this._refreshButtonPressed()).then(() => alert('Chip added'))
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
        <View style={{flexDirection: 'column', flex: 1}}>
          <Text style={{flex: 0.1, marginLeft: 10, marginRight: 10, marginBottom: 20, textAlign: 'center'}}>
            Tap on a chip to modify the denomination or colors.
          </Text>
          <ScrollView style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._refreshButtonPressed.bind(this)}
              />
            }
          >
            {chips.map((item, i) => (
              <Avatar
                key={i}
                large
                rounded
                title={item.denom}
                titleStyle={{color: item.textColor, fontSize: 14}}
                activeOpacity={1}
                overlayContainerStyle={{backgroundColor: item.color}}
                onPress={this._navigateToChipEdit.bind(this, item.id)}
                containerStyle={{flex: 0.2, margin: 10, borderWidth: 4, borderColor: item.rimColor}}
              />
            ))
            }
            {this.state.user && <Button style={{flex:-1}} onPress={this._addButtonPressed.bind(this, "after", chips[chips.length - 1])} icon={{name: 'playlist-add'}} title="Add"></Button>}
          </ScrollView>
        </View>
      )
    }
  }
}

export default compose(
  graphql(getTournamentChipsQuery, { name: 'getTournamentChipsQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(createTournamentChipMutation, {name: 'createTournamentChipMutation'}),
)(ChipListScreen)