import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, RefreshControl, } from 'react-native'
import { ListItem, Button} from 'react-native-elements'
import { currentUserQuery, tournamentCosts, getTournamentCostsQuery, createTournamentCostMutation, deleteCostMutation, createCostBuyMutation, deleteBuyMutation, lastBuyOnCost} from '../constants/GQL'
import { dictionaryLookup, sortEntryFees } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/ListHeader'

class CostListScreen extends React.Component {

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
          "tournamentId": this.props.navigation.state.params.id,
          "costType": "Buyin",
          "price": 20,
          "chipStack": 1000,
        }
      }
    ).then((result) => {
      Events.publish('RefreshCostList')
      console.log(result.data)
      this._editButtonPressed(result.data.createCost.id)
    })
  }

  _editButtonPressed(cost) {
    this.props.navigation.navigate('CostEdit', 
      {
        cost: cost
      }
    )
  }
  
  _deleteButtonPressed(id) {
    this.setState({loading: true})
    this.props.deleteItem({variables: {id: id} }).then(
      () => Events.publish('RefreshCostList')
    )
  }

  _addAnonymousBuyPressed(id) {
    this.props.createCostBuyMutation({variables: {costId: id}}).then(
      () => Events.publish('RefreshCostList')
    )
  }

  _search(searchText) {
  }

  render() {
    const { getData: { loading, error, allCosts } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && allCosts.length > 0 && this.state.user.id === allCosts[0].tournament.user.id
      const list = sortEntryFees(allCosts)
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
            <View>
              {
                list && list.map((item, i) => (
                  <Swipeout
                    key={i}
                    autoClose={true}
                    right={[
                      {
                        text: 'Edit',
                        onPress: this._editButtonPressed.bind(this, item),
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
                    subtitle={item.chipStack && item.chipStack.toLocaleString() + ' Chips, ' + item._buysMeta.count + ' buys.'}
                    onPress={this._editButtonPressed.bind(this, item)}
                  />
                  </Swipeout>
                ))
              }
            </View>
          </ScrollView>
          <BannerAd/>
        </View>
      )
    }
  }
}

export default compose(
  graphql(createTournamentCostMutation, {name: 'createItem'}),
  graphql(deleteCostMutation, { name: 'deleteItem' }),
  graphql(tournamentCosts, { name: 'getData', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(createCostBuyMutation, {name: 'createCostBuyMutation', }),
  graphql(deleteBuyMutation, {name: 'deleteBuyMutation', }),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(CostListScreen)