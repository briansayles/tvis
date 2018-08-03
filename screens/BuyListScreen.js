import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, RefreshControl, } from 'react-native'
import {List, ListItem, Button} from 'react-native-elements'
import { currentUserQuery, getTournamentBuysQuery, createCostBuyMutation, deleteBuyMutation} from '../constants/GQL'
import { dictionaryLookup, sortEntryFees } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/ListHeader'

class BuyListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      refreshing: false,
      loading: false,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshCostList', () => this._refresh())
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      this.setState({user: nextProps.currentUserQuery.user || null})
    }
  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refresh() {
    this.props.getData.refetch().then(() => this.setState({loading: false}))
  }

  _addButtonPressed() {
    this.setState({loading: true})
    this.props.createItem(
      {
        variables:
        {
          "tournamentId": this.props.getData.Tournament.id,
          "costType": "Buyin",
          "price": 20,
          "chipStack": 1000,
        }
      }
    ).then((result) => {
      Events.publish('RefreshCostList')
      this._editButtonPressed(result.data.createCost.id)
    })
  }

  _editButtonPressed(id) {
    this.props.navigation.navigate('CostEdit', {id: id})
  }

  _deleteButtonPressed(id) {
    this.setState({loading: true})
    this.props.deleteItem({variables: {id: id} }).then(
      () => Events.publish('RefreshCostList')
    )
  }

  _search(searchText) {
    // searchText will be the text entered into the search bar
  }

  render() {
    const { getData: { loading, error, Tournament } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const list = sortEntryFees(Tournament.costs)
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ListHeader 
            title="Entry Fee(s)" 
            showAddButton={this.state.user} 
            loading={this.state.loading} 
            onAddButtonPress={this._addButtonPressed.bind(this)}
            // onSearch={this._search}
          />
          <ScrollView 
            style={{flex: 1, marginLeft: 5, marginRight: 5}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._refresh.bind(this)}
              />
            }
          >
            <List>
              {
                list && list.map((item, i) => (
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
                    title={item.costType && dictionaryLookup(item.costType, "EntryFeeOptions", "long") + ": " + (item.price && item.price.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true}))}
                    subtitle={item.chipStack && item.chipStack.toLocaleString() + ' Chips'}
                    onPress={this._editButtonPressed.bind(this, item.id)}
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
  graphql(createCostBuyMutation, {name: 'createItem'}),
  graphql(deleteBuyMutation, { name: 'deleteItem' }),
  graphql(getTournamentBuysQuery, { name: 'getData', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(BuyListScreen)