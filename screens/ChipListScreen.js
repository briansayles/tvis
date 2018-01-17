import {graphql, compose} from 'react-apollo'
// import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage, } from 'react-native'
import { List, ListItem, Avatar, Button, Card, PricingCard} from 'react-native-elements';
// import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getTournamentChipsQuery, createTournamentChipMutation, deleteChipMutation,} from '../constants/GQL'
import { sortChips, numberToSuffixedString, dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'

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
          "denom": 1,
          "color": "#fff",
        }
      }
    ).then(() => this._refreshButtonPressed()).then(() => alert('Chip added'))
  }

  _deleteChipButtonPressed(id) {
    this.props.deleteChipMutation({variables: {id: id} }).then(
      () => Events.publish('RefreshChipList')
    )
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
                <Swipeout
                  key={i}
                  autoClose={true}
                  right={[
                    {
                      text: 'Edit',
                      onPress: this._navigateToChipEdit.bind(this, item.id),
                      type: 'primary',
                    },
                    {
                      text: 'DELETE',
                      onPress: this._deleteChipButtonPressed.bind(this, item.id),
                      backgroundColor: '#ff0000',
                      type: 'delete',
                    },
                  ]}
                >
                <ListItem
                  title={numberToSuffixedString(item.denom) + ": " + dictionaryLookup(item.color, "ChipColorOptions", "long")}
                  onPress={this._navigateToChipEdit.bind(this, item.id)}
                />
                </Swipeout>
              ))
            }
          </List>
          {this.state.user && <Button style={{flex:-1}} onPress={this._addButtonPressed.bind(this, "after", chips[chips.length - 1])} icon={{name: 'playlist-add'}} title="Add"></Button>}
        </ScrollView>
      )
    }
  }
}

export default compose(
  graphql(getTournamentChipsQuery, { name: 'getTournamentChipsQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(createTournamentChipMutation, {name: 'createTournamentChipMutation'}),
  graphql(deleteChipMutation, { name: 'deleteChipMutation' }),
)(ChipListScreen)