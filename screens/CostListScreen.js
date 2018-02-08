import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, RefreshControl, } from 'react-native'
import {List, ListItem, Button} from 'react-native-elements'
import { currentUserQuery, getTournamentCostsQuery, createTournamentCostMutation, deleteCostMutation} from '../constants/GQL'
import { dictionaryLookup, sortEntryFees } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'

class CostListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      user: null,
      creating: false,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshCostList', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      const user = nextProps.currentUserQuery.user || null
      this.setState({user: user})
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
    this.setState({creating: true})
    this.props.createTournamentCostMutation(
      {
        variables:
        {
          "tournamentId": this.props.getTournamentCostsQuery.Tournament.id,
          "costType": "Buyin",
          "price": 20,
          "chipStack": 1000,
        }
      }
    ).then((result) => {
      this._refreshButtonPressed()
      this.setState({creating: false})
      this._navigateToCostEdit(result.data.createCost.id)
    }
    )
  }

  _navigateToCostEdit(id) {
    this.props.navigation.navigate('CostEdit', {id: id})
  }

  _deleteCostButtonPressed(id) {
    this.props.deleteCostMutation({variables: {id: id} }).then(
      () => Events.publish('RefreshCostList')
    )
  }

  render() {
    const { getTournamentCostsQuery: { loading, error, Tournament } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const fees = sortEntryFees(Tournament.costs)
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <View style={{marginTop: 5}}>
            {this.state.user && !this.state.creating && <Button buttonStyle={{backgroundColor: "green"}} onPress={this._addButtonPressed.bind(this)} icon={{name: 'playlist-add'}} title="New"></Button>}
            {this.state.user && this.state.creating && <ActivityIndicator/>}
          </View>
          <ScrollView 
            style={{flex: 1, marginLeft: 5, marginRight: 5}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._refreshButtonPressed.bind(this)}
              />
            }
          >
            <List>
              {
                fees.map((item, i) => (
                  <Swipeout
                    key={i}
                    autoClose={true}
                    right={[
                      {
                        text: 'Edit',
                        onPress: this._navigateToCostEdit.bind(this, item.id),
                        type: 'primary',
                      },
                      {
                        text: 'DELETE',
                        onPress: this._deleteCostButtonPressed.bind(this, item.id),
                        backgroundColor: '#ff0000',
                        type: 'delete',
                      },
                    ]}
                  >
                  <ListItem
                    title={item.costType && dictionaryLookup(item.costType, "EntryFeeOptions", "long") + ": " + (item.price && item.price.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true}))}
                    subtitle={item.chipStack && item.chipStack.toLocaleString() + ' Chips'}
                    onPress={this._navigateToCostEdit.bind(this, item.id)}
                  />
                  </Swipeout>
                ))
              }
            </List>
          </ScrollView>
          <BannerAd/>
        </View>
      )
    }
  }
}

export default compose(
  graphql(getTournamentCostsQuery, { name: 'getTournamentCostsQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(createTournamentCostMutation, {name: 'createTournamentCostMutation'}),
  graphql(deleteCostMutation, { name: 'deleteCostMutation' }),
)(CostListScreen)