import { graphql, compose } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage } from 'react-native'
import { List, ListItem, Button } from 'react-native-elements'
import { currentUserQuery, currentUserTournamentsQuery, createTournamentMutation, deleteTournamentMutation, getTournamentQuery, createTournamentFromExistingTournamentMutation} from '../constants/GQL' // copyTournamentMutation, 
import Auth from '../components/Auth'
import { NewButton } from '../components/NewButton'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { AdMobRewarded } from 'expo'
import { client, showRewardedAd } from '../main'
import { convertItemToInputType } from '../utilities/functions'

class TournamentListScreen extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      refreshing: false,
      creating: false,
    }
  }

  static navigationOptions = {

  }

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshTournamentList', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      if (nextProps.currentUserQuery.user !== this.state.user) {
        this.props.currentUserTournamentsQuery.refetch()
      }
      this.setState({user: nextProps.currentUserQuery.user || null})
    }
  }

  componentDidUpdate(prevProps) {
  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _addButtonPressed = async () => {
    this.setState({creating: true})
    this.props.createTournamentMutation(
      {
        variables: { "userId": this.props.currentUserQuery.user.id }
      }
    ).then((result) => {
      this._refreshButtonPressed()
      this.setState({creating: false})
      this._navigateToEdit(result.data.createTournament.id)
    })
  }

  _refreshButtonPressed() {
    this.props.currentUserTournamentsQuery.refetch()
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible})
  }

  _navigateToEdit(id) {
    this.props.navigation.navigate('Edit', {id: id})
  }

  _copyTournament(id) {
    // TODO: Implement ActivityIndicator --- But where???
    this.setState({creating: true})
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
        this.props.currentUserTournamentsQuery.refetch().then(() => this.setState({creating: false}))
        this._navigateToEdit(result.data.createTournament.id)
      }).catch((error) => {
        this.setState({creating: false})
        alert("This function doesn't work yet. It's on the TO DO list, though! " + newTitle)
      })
    }).catch((error) => {
      this.setState({creating: false})
      alert("This function doesn't work yet. It's on the TO DO list, though! " + newTitle)
    })
  }

  _deleteTournamentButtonPressed(id) {
    // const tournamentId = this.props.getSegmentQuery.Segment.tournament.id
    this.props.deleteTournamentMutation({variables: {id: id} }).then(
      () => Events.publish('RefreshTournamentList')
    )
  }

  render() {
    const { currentUserTournamentsQuery: { loading, error, user } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return (<Text>{error.message}</Text>)
    } else if (!user) {
      return (<Auth/>)
    } else {
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <View style={{marginTop: 5, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
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
                user.tournaments && user.tournaments.map((item, i) => (
                  <Swipeout
                    key={i}
                    autoClose={true}
                    right={[
                      {
                        text: 'Copy',
                        onPress: this._copyTournament.bind(this, item.id),
                        type: 'default'
                      },
                      {
                        text: 'Edit',
                        onPress: this._navigateToEdit.bind(this, item.id),
                        type: 'primary',
                      },
                      {
                        text: 'DELETE',
                        onPress: this._deleteTournamentButtonPressed.bind(this, item.id),
                        backgroundColor: '#ff0000',
                        type: 'delete',
                      },
                    ]}
                  >
                    <ListItem
                      title={item.title}
                      subtitle={item.subtitle}
                      onPress={this._navigateToEdit.bind(this, item.id)}
                    />
                  </Swipeout>
                  )
                )
              }
            </List>
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
  graphql(currentUserQuery, { name: 'currentUserQuery' }),
  graphql(currentUserTournamentsQuery, { name: 'currentUserTournamentsQuery' }),
  graphql(createTournamentMutation, { name: 'createTournamentMutation'}),
  graphql(deleteTournamentMutation, { name: 'deleteTournamentMutation' }),
  // graphql(copyTournamentMutation, {name: 'copyTournamentMutation'}),
)(TournamentListScreen)