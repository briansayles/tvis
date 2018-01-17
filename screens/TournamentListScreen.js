import {graphql, compose} from 'react-apollo'
import React from 'react'
import {Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import {List, ListItem, Button} from 'react-native-elements'
import {currentUserQuery, currentUserTournamentsQuery, createTournamentMutation, deleteTournamentMutation, addCreditsMutation, } from '../constants/GQL'
import Auth from '../components/Auth'
import { NewButton } from '../components/NewButton'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../screens/Ads'
import { AdMobRewarded } from 'expo'
import { showRewardedAd } from '../main'

class TournamentListScreen extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      refreshing: false,
    }
  }

  static navigationOptions = {

  }

  componentDidMount() {
    // AdMobRewarded.setAdUnitID('ca-app-pub-3940256099942544/5224354917')
    // AdMobRewarded.setTestDeviceID('EMULATOR')
    // AdMobRewarded.requestAd((result) => {
    //   console.log(JSON.stringify(result))
    // })
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

  _openRewarded = () => {

    AdMobRewarded.setAdUnitID('ca-app-pub-3013833975597353/7633439481')
    // AdMobRewarded.setTestDeviceID('EMULATOR');
    AdMobRewarded.requestAd((result) => {
      console.log(JSON.stringify(result))
      AdMobRewarded.showAd((result) => {
        console.log(JSON.stringify(result))
      })
    });
    // AdMobRewarded.requestAd((result) => {
    //   console.log (JSON.stringify(result))
    // }).then(() => {
    //   AdMobRewarded.showAd((result) => {
    //     console.log(JSON.stringify(result))
    //   })
    // })
  }


  // _showRewardedAdPressed () {
  //   showRewardedAd()
  // }

  _addButtonPressed = async () => {
    this.props.createTournamentMutation(
      {
        variables: { "userId": this.props.currentUserQuery.user.id }
      }
    )
    .then((result) => {
      this._refreshButtonPressed()
      // alert('tournament added')
    })
  }

  _refreshButtonPressed() {
    this.props.currentUserTournamentsQuery.refetch()
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible})
  }

  _navigateToDetails(id) {
    this.props.navigation.navigate('Details', {id: id})
  }

  _navigateToEdit(id) {
    this.props.navigation.navigate('Edit', {id: id})
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
      return <Text>Loading...</Text>
    } else if (error) {
      return (<Text>{error.message}</Text>)
    } else if (!user) {
      return (<Auth/>)
    } else {
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <View style={{marginTop: 5}}>
            {this.state.user && <Button buttonStyle={{backgroundColor: "green"}} onPress={this._openRewarded} icon={{name: 'playlist-add'}} title="Show Ad"></Button>}
            {this.state.user && <Button buttonStyle={{backgroundColor: "green"}} onPress={this._addButtonPressed.bind(this)} icon={{name: 'playlist-add'}} title="New"></Button>}
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
  graphql(addCreditsMutation, {name: 'addCreditsMutation'}),
)(TournamentListScreen)