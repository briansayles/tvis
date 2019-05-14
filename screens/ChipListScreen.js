import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage, } from 'react-native'
import { ListItem, Avatar, Button, Card, PricingCard} from 'react-native-elements';
import { currentUserQuery, getTournamentChipsQuery, createTournamentChipMutation, deleteChipMutation,} from '../constants/GQL'
import { sortChips, numberToSuffixedString, dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/ListHeader'

class ChipListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      // user: null,
      refreshing: false,
      loading: false,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEventSubscription = Events.subscribe('RefreshChipList', () => this._onRefresh())
  }

  componentWillUnmount () {
    this.refreshEventSubscription.remove()
  }

  _onRefresh = async () => {
    await this.props.getData.refetch()
  }

  _addButtonPressed = async () => {
    this.setState({loading: true})
    result = await this.props.createItem(
      {
        variables:
        {
          "tournamentId": this.props.getData.Tournament.id,
          "denom": 1,
          "color": "#fff",
        }
      }
    )
    Events.publish('RefreshChipList')
    this.setState({loading: false})
    console.log('passing chip: ' + JSON.stringify(result.data.createChip))
    this._editButtonPressed(result.data.createChip)
  }

  _editButtonPressed(chip) {
    this.props.navigation.navigate('ChipEdit', 
      {
        chip: chip
      }
    )
  }
  
  _deleteButtonPressed(id) {
    this.setState({loading: true})
    this.props.deleteItem({variables: {id: id} }).then(
      () => Events.publish('RefreshChipList')
    ).then(()=>this.setState({loading: false}))
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
      const list = sortChips(parent.chips)
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ListHeader 
            title="Chips" 
            showAddButton={userIsOwner}
            loading={this.state.loading} 
            onAddButtonPress={this._addButtonPressed}
            // onSearch={this._search}
          />
          <ScrollView 
            style={{flex: 1, marginLeft: 5, marginRight: 5}}
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
                    titleStyle={{color: item.color != "#fff" ? item.color : "#000"}} 
                    title={dictionaryLookup(item.color, "ChipColorOptions", "long")}
                    subtitle={numberToSuffixedString(item.denom)}
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
  graphql(createTournamentChipMutation, {name: 'createItem'}),
  graphql(deleteChipMutation, { name: 'deleteItem' }),
  graphql(getTournamentChipsQuery, { name: 'getData', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(ChipListScreen)