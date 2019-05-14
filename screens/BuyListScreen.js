import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, RefreshControl, } from 'react-native'
import { ListItem, Button, Card, Icon} from 'react-native-elements'
import { currentUserQuery, getTournamentBuysQuery, createCostBuyMutation, deleteBuyMutation} from '../constants/GQL'
import { dictionaryLookup, sortEntryFees, totalItems } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { AddButton, RemoveButton, ListHeader, } from '../components/FormComponents'
import { BannerAd } from '../components/Ads'
// import {  } from '../components/ListHeader'

class BuyListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      loading: false,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.setState({user: this.props.currentUserQuery.user})
    this.refreshEventSubscription = Events.subscribe('RefreshCostList', () => this._onRefresh())
  }

  componentWillReceiveProps = async (nextProps) => {
    nextProps.getData.refetch()
    nextProps.currentUserQuery.refetch()
  }

  componentWillUnmount () {
    this.refreshEventSubscription.remove()
  }

  _onRefresh = async () => {
    await this.props.getData.refetch()
  }

  _search(searchText) {
  }

  render() {
    const { getData: { loading: loadingData, error: errorData, Tournament } } = this.props
    const { currentUserQuery: { loading: loadingUser, error: errorUser, user}} = this.props
    if (loadingData || loadingUser) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (errorData || errorUser) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = user.id === Tournament.user.id
      const list = sortEntryFees(Tournament.costs)
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ListHeader 
            title="Entry Fee(s)" 
            loading={this.state.loading} 
          />
          <ScrollView 
            style={{flex: 1, marginLeft: 5, marginRight: 5}}
          >
            <View style={{flex: 1, }}>
              {
                list && list.map((item, i) => (

                  <Card
                    key={i}
                    title={item.costType && dictionaryLookup(item.costType, "EntryFeeOptions", "long")}
                    containerStyle={{marginBottom: 4}}
                  >
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <Text style={{flex: 2}}>
                        Count: {item.buys.length}{'\n'}
                        Cash In: {(item._buysMeta.count * item.price).toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true})}{'\n'}
                        Chips Issued: {(item._buysMeta.count * item.chipStack).toLocaleString()}
                      </Text>
                      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
                        <AddButton
                          mutation={this.props.createItem}
                          events={["RefreshCostList"]}
                          variables={{costId: item.id}}
                          containerStyle={{flex: 2}}
                        />
                        <RemoveButton 
                          mutation={this.props.deleteItem}
                          events={["RefreshCostList"]}
                          variables={{
                            id: (item._buysMeta.count > 0 && item.buys[item._buysMeta.count -1].id) || null,
                          }}
                          containerStyle={{flex: 2}}
                        />
                      </View>
                    </View>
                  </Card>
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
  graphql(createCostBuyMutation, {name: 'createItem'}),
  graphql(deleteBuyMutation, { name: 'deleteItem' }),
  graphql(getTournamentBuysQuery, { name: 'getData', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(BuyListScreen)