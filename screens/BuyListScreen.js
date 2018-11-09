import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, RefreshControl, } from 'react-native'
import {List, ListItem, Button, Card, Icon} from 'react-native-elements'
import { currentUserQuery, getTournamentBuysQuery, createCostBuyMutation, deleteBuyMutation} from '../constants/GQL'
import { dictionaryLookup, sortEntryFees, totalItems } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { AddButton, RemoveButton, } from '../components/FormComponents'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/ListHeader'

class BuyListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      refreshing: false,
      loading: false,
      busy: false,
      costs: {},
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
    if (!nextProps.getData.loading) {
      for (var i = 0, len = nextProps.getData.Tournament.costs.length; i < len; i++) {
        var total = totalItems(nextProps.getData.Tournament.costs[i])
      }
    }
  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refresh() {
    this.setState({loading: true})
    this.props.getData.refetch().then(() => this.setState({loading: false}))
  }

  _addButtonPressed(costItem) {
    this.setState({busy: true})
    this.props.createItem(
      {
        variables:
        {
          "costId": costItem.id
        }
      }
    ).then((result) => {
      Events.publish('RefreshCostList')
    }).then(() => {
      this.setState({busy: false})
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
            loading={this.state.loading} 
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
            <List style={{flex: 1, }}>
              {
                list && list.map((item, i) => (

                  <Card
                    key={i}
                    title={item.costType && dictionaryLookup(item.costType, "EntryFeeOptions", "long")}
                    containerStyle={{marginBottom: 10}}
                  >
                    <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
                      <Text>
                        Count: {item.buys.length}{'\n'}
                        Cash In: {(item._buysMeta.count * item.price).toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true})}{'\n'}
                        Chips Issued: {(item._buysMeta.count * item.chipStack).toLocaleString()}
                      </Text>
                      <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <RemoveButton 
                          containerStyle={{flex: 1}}
                          mutation={this.props.deleteItem}
                          events={["RefreshCostList"]}
                          variables={{
                            id: (item._buysMeta.count > 0 && item.buys[item._buysMeta.count -1].id) || null,
                          }}
                        />
                        <AddButton
                          containerStyle={{flex: 1}}
                          mutation={this.props.createItem}
                          events={["RefreshCostList"]}
                          variables={{costId: item.id}}
                        />
                      </View>
                    </View>
                  </Card>
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