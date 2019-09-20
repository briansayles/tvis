import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, RefreshControl, StyleSheet,} from 'react-native'
import { ListItem, Button} from 'react-native-elements'
import { currentUserQuery, tournamentCosts, getTournamentCostsQuery, createTournamentCostMutation, deleteCostMutation, createCostBuyMutation, deleteBuyMutation, lastBuyOnCost} from '../constants/GQL'
import { dictionaryLookup, sortEntryFees } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/FormComponents'
import { convertItemToInputType, responsiveFontSize } from '../utilities/functions'

class CostListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      loading: false,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEventSubscription = Events.subscribe('RefreshCostList', () => this._onRefresh())
  }

  componentWillUnmount () {
    this.refreshEventSubscription.remove()
  }

  _onRefresh = async () => {
    console.log('_onRefresh CostListScreen')
    await this.props.getData.refetch()
  }

  _addButtonPressed = async () => {
    this.setState({loading: true})
    result = await this.props.createItem(
      {
        variables:
        {
          "tournamentId": this.props.navigation.state.params.id,
          "costType": "Buyin",
          "price": 20,
          "chipStack": 1000,
        }
      }
    )
    Events.publish('RefreshCostList')
    this.setState({loading: false})
    console.log('passing cost: ' + JSON.stringify(result.data.createCost))
    this._editButtonPressed(result.data.createCost)
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
    ).then(()=>this.setState({loading: false}))
  }

  _search(searchText) {
  }

  render() {
    const { getData: { loading: loadingData, error: errorData, Tournament } } = this.props
    const { currentUserQuery: { loading: loadingUser, error: errorUser, user}} = this.props
    if (loadingData || loadingUser || !Tournament || !user) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (errorData || errorUser) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = user.id === Tournament.user.id
      const parent = Tournament
      const list = sortEntryFees(parent.costs)
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'white', }}>
          <ListHeader 
            title="Entry Fee(s)" 
            showAddButton={userIsOwner} 
            loading={this.state.loading} 
            onAddButtonPress={this._addButtonPressed.bind(this)}
            // onSearch={this._search}
          />
          <ScrollView 
            style={{flex: 1, marginLeft: 5, marginRight: 5}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh.bind(this)}
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
                    titleStyle={[ styles.listItemTitle, ]}
                    subtitleStyle={[ styles.listItemSubtitle, ]}
                    bottomDivider
                    chevron

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
  graphql(getTournamentCostsQuery, { name: 'getData', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(CostListScreen)

const styles = StyleSheet.create({
  active: {
    fontWeight: 'bold',
  },
  listItemTitle: {
    fontSize: responsiveFontSize(1.75),

  },
  listItemSubtitle: {
    fontSize: responsiveFontSize(1.5),
    color: '#888'
  }
});