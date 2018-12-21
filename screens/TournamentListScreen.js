import { graphql, compose, withApollo } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, List } from 'react-native'
import { ListItem, Button } from 'react-native-elements'
import { currentUserQuery, currentUserTournamentsQuery, createTournamentMutation, deleteTournamentMutation, getTournamentQuery, createTournamentFromExistingTournamentMutation} from '../constants/GQL' // copyTournamentMutation, 
import Auth from '../components/Auth'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/ListHeader'
import { AdMobRewarded } from 'expo'
import { convertItemToInputType } from '../utilities/functions'

class TournamentListScreen extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      refreshing: false,
      loading: false,
    }
  }

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshTournamentList', () => this._refresh())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      if (nextProps.currentUserQuery.user !== this.state.user) {
        Events.publish("RefreshTournamentList")
      }
      this.setState({user: nextProps.currentUserQuery.user || null})
    }
  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refresh() {
    this.props.getData.refetch().then(() => this.setState({loading: false}))
  }

  _addButtonPressed = async (parentId) => {
    this.setState({loading: true})
    this.props.createItemMutation(
      {
        variables: { "userId": parentId }
      }
    ).then((result) => {
      Events.publish('RefreshTournamentList')
      this._editButtonPressed(result.data.createTournament.id)
    })
  }

  _editButtonPressed(id) {
    this.props.navigation.navigate('Edit', {id: id})
  }

  _deleteButtonPressed(id) {
    this.setState({loading: true})
    this.props.deleteItemMutation({variables: {id: id} }).then(
      () => Events.publish('RefreshTournamentList')
    )
  }

  _copyButtonPressed(id) {
    this.setState({loading: true})
    const {client} = this.props
    client.query({ query: getTournamentQuery, variables: {id: id} }).then((result) => {
      const {user, title, subtitle, comments, game, costs, chips, segments} = result.data.Tournament
      const userId = user.id
      const newTitle = "Copy of " + title
      const costsInput = costs.map((i, index) => {
        return convertItemToInputType (i, ["tournamentId"])
      })
      const chipsInput = chips.map((i, index) => {
        return convertItemToInputType (i, ["tournamentId"])
      })
      const segmentsInput = segments.map((i, index) => {
        return convertItemToInputType (i, ["tournamentId"])
      })
      client.mutate({mutation: createTournamentFromExistingTournamentMutation, variables: {
        userId: userId, title: newTitle, subtitle: subtitle, comments: comments, game: game, costs: costsInput, chips: chipsInput, segments: segmentsInput
      }}).then((result) => {
        Events.publish('RefreshTournamentList')
        this._editButtonPressed(result.data.createTournament.id)
      }).catch((error) => {
        this.setState({loading: false})
      })
    }).catch((error) => {
      this.setState({loading: false})
    })
  }

  _search(searchText) {
    // searchText will be the text entered into the search bar
  }

  render() {
    const { getData: { loading, error, user } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return (<Text>{error.message}</Text>)
    } else if (!user) {
      return (<Auth/>)
    } else {
      const parent = user
      const list = parent.tournaments
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ListHeader 
            title="Tournaments" 
            showAddButton={this.state.user} 
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
                        text: 'Copy',
                        onPress: this._copyButtonPressed.bind(this, item.id),
                        type: 'default'
                      },
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
                      title={item.title}
                      subtitle={item.subtitle}
                      subtitleStyle={{color: '#888'}}
                      containerStyle={{backgroundColor: '#ddd'}}
                      onPress={this._editButtonPressed.bind(this, item.id)}
                      chevron = {{color: "black"}}
                    />
                  </Swipeout>
                  )
                )
              }
            </View>
          </ScrollView>
          <BannerAd />
        </View>
      )
    }
  }

  _endRef = (element) => {
    this.endRef = element
  }
}

export default compose(
  graphql(createTournamentMutation, { name: 'createItemMutation'}),
  graphql(deleteTournamentMutation, { name: 'deleteItemMutation' }),
  graphql(currentUserTournamentsQuery, { name: 'getData' }),
  graphql(currentUserQuery, { name: 'currentUserQuery' }),
  withApollo,
)(TournamentListScreen)