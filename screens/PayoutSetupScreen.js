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

class PayoutSetupScreen extends React.Component {

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

  render() {
    return null

  }
}

export default compose(
  // graphql(createCostBuyMutation, {name: 'createItem'}),
  // graphql(deleteBuyMutation, { name: 'deleteItem' }),
  // graphql(getTournamentBuysQuery, { name: 'getData', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(PayoutSetupScreen)