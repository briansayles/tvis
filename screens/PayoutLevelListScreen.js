import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, RefreshControl, } from 'react-native'
import { ListItem, Button, Card, Icon} from 'react-native-elements'
import { currentUserQuery, getTournamentPayoutLevelsQuery, createTournamentPayoutLevelMutation, deletePayoutLevelMutation} from '../constants/GQL'
import { dictionaryLookup, sortEntryFees, totalItems } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { AddButton, RemoveButton, } from '../components/FormComponents'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/FormComponents'

class PayoutLevelListScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      refreshing: false,
      loading: false,
      busy: false,
    }
  }


  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshPayoutLevelList', () => this._refresh())
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
          "levelNumber": this.props.getData.Tournament._payoutLevelsMeta.count,
          "payCount": 1,
          "playerCount": 5,
        }
      }
    ).then((result) => {
      Events.publish('RefreshPayoutLevelList')
    })
  }

  _editButtonPressed(id) {
    this.props.navigation.navigate('PayoutLevelEdit', {id: id})
  }

  _deleteButtonPressed(id) {
    this.setState({loading: true})
    this.props.deleteItem({variables: {id: id} }).then(
      () => Events.publish('RefreshPayoutLevelList')
    )
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
      const parent = Tournament
      const rawList = Tournament.payoutLevels
      const list = []
      var cumulativePlayerCount = 0
      var cumulativePayCount = 0
      for (var i = 0, len = rawList.length; i < len; i++) {
        cumulativePlayerCount += rawList[i].playerCount
        cumulativePayCount += rawList[i].payCount
        list.push({cumulativePayCount, cumulativePlayerCount, id: rawList[i].id, levelNumber: rawList[i].levelNumber})
      }
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ListHeader 
            title="Payout Levels" 
            showAddButton={userIsOwner} 
            loading={this.state.loading} 
            onAddButtonPress={this._addButtonPressed.bind(this, parent.id)}
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
                    title={'Pay ' + item.cumulativePayCount + ' for up to ' + item.cumulativePlayerCount + ' players.'}
                    onPress={this._editButtonPressed.bind(this, item.id)}
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
  graphql(createTournamentPayoutLevelMutation, {name: 'createItem'}),
  graphql(deletePayoutLevelMutation, { name: 'deleteItem' }),
  graphql(getTournamentPayoutLevelsQuery, { name: 'getData', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(PayoutLevelListScreen)