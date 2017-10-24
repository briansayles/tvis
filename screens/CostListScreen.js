import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage, } from 'react-native'
import { List, ListItem, Avatar, Button, Card, PricingCard} from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getTournamentCostsQuery, createTournamentCostMutation, } from '../constants/GQL'
import { sortSegments, sortChips } from '../utilities/functions'
import Events from '../api/events'

class CostListScreen extends React.Component {

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
    this.refreshEvent = Events.subscribe('RefreshCostList', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getTournamentCostsQuery) {
      this.setState({formData: nextProps.getTournamentCostsQuery})
    }
  }
  
  componentDidUpdate(prevProps) {

  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refreshButtonPressed() {
    this.props.getTournamentCostsQuery.refetch()
    // alert('Editor refreshed')
  }

  _addButtonPressed() {
    this.props.createTournamentCostMutation(
      {
        variables:
        {
          "tournamentId": this.props.getTournamentCostsQuery.Tournament.id,
          "price": 20,
          "chipStack": 1000,
        }
      }
    ).then(() => this._refreshButtonPressed()).then(() => alert('Cost added'))
  }

  _navigateToCostEdit(id) {
    this.props.navigation.navigate('CostEdit', {id: id})
  }

  render() {
    const { getTournamentCostsQuery: { loading, error, Tournament } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const costs = Tournament.costs
      return (
        <View style={{flexDirection: 'column', flex: 1}}>
          <Text style={{flex: 0.1, marginLeft: 10, marginRight: 10, marginBottom: 20, textAlign: 'center'}}>
            Tap on a cost to modify it.
          </Text>
          <ScrollView style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._refreshButtonPressed.bind(this)}
              />
            }
          >          
            {costs && costs.map((item, i) => (
              <PricingCard
                key={i}
                color='#4f9deb'
                title={item.costType}
                price={item.price.toLocaleString({style: 'currency', currency: 'USD', currencyDisplay: 'symbol'})}
                info={[item.chipStack.toLocaleString() + ' Chips']}
                button={{ title: 'Edit', icon: 'flight-takeoff' }}
                onButtonPress={this._navigateToCostEdit.bind(this, item.id)}
              >             
              </PricingCard>
            ))
            }
          {this.state.user && <Button style={{flex:-1}} onPress={this._addButtonPressed.bind(this)} icon={{name: 'playlist-add'}} title="Add"></Button>}
          </ScrollView>
        </View>
      )
    }
  }
}

export default compose(
  graphql(getTournamentCostsQuery, { name: 'getTournamentCostsQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(createTournamentCostMutation, {name: 'createTournamentCostMutation'}),
)(CostListScreen)