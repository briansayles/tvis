import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import Expo from 'expo';
import {client} from '../main';
import {msToTime} from '../utilities/functions';

const currentUserQuery = gql`
  query currentUser {
      user {
          id
          name
      }
  }
`

const getTournamentQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      title
      updatedAt
      timer {
        id
        active
        createdAt
        updatedAt
        elapsed
      }
      segments {
        id
        duration
        sBlind
        bBlind
        ante
        game
      }
      chips {
        denom
        color
      }
      tags {
        name
      }
    }
  }
`

const changeTitle = gql`
  mutation updateTournamentTitle ($id: ID!, $newTitle: String) {
    updateTournament(id: $id, title: $newTitle) {
      id
    }
  }
`

const updateTournamentTimer = gql`
  mutation updateTournamentTimer($id: ID!, $active: Boolean!, $tournamentId: ID!, $now: DateTime, $elapsed: Int) {
    updateTimer(id: $id, active: $active, elapsed: $elapsed) {
      id
    }
    updateTournament(id: $tournamentId, childrenUpdatedAt: $now) {
      id
    }
  }
`

class TournamentDetailsScreen extends React.Component {

  static navigationOptions = {
    title: "Tournament Details"
  };
  

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      time: new Date(),
    }
  }

  componentDidMount() {
    client.query({query: currentUserQuery}).then(
      result => {
        if (result.data.user) {
          this.setState({
            user: {
              name: result.data.user.name,
              id: result.data.user.id,
            }
          });
        }
      }
    );  
     // Subscribe to `UPDATED`-mutations
    this.updateTournamentSubscription = this.props.getTournament.subscribeToMore({
      document: gql`
        subscription {
          Tournament(filter: {
            mutation_in: [UPDATED]
          }) {
            node {
              id
            }
          }
        }
      `,
      updateQuery: (previous, {subscriptionData}) => {
        this.props.getTournament.refetch()
        return
      },
      onError: (err) => {
        console.error(err)
      },
    });
    this.clockInterval = setInterval(()=> {
      this.setState({time: new Date()})
      if (this.props.navigator.getCurrentRoute().routeName !== 'tournamentDetails') {clearInterval(this.clockInterval)}
    },100);
  }

  componentWillUnmount () {
    clearInterval(this.clockInterval)
  }

  _timeRemaining() {
    const tourney = this.props.getTournament.Tournament
    const segments = tourney.segments
    const timer = tourney.timer
    const totalElapsedMS = timer.active?
      timer.elapsed + this.state.time.valueOf() - new Date(timer.updatedAt).valueOf()
      :
      timer.elapsed
    var cumulativeMS = 0
    var currentSegmentIndex = 0
    for (var i = 0, len = segments.length; i < len; i++) {
      if (totalElapsedMS >= cumulativeMS && totalElapsedMS < (cumulativeMS + segments[currentSegmentIndex].duration * 60 * 1000)) {currentSegmentIndex = i}
      cumulativeMS += segments[currentSegmentIndex].duration * 60 * 1000
    }
    const duration = segments[currentSegmentIndex].duration * 60 * 1000
    const ms = timer.active ? 
      Math.floor(duration - totalElapsedMS)
      :
      Math.floor(duration - totalElapsedMS)
    return {display: msToTime(ms), segment: segments[currentSegmentIndex], csi: currentSegmentIndex}
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible});
  }

  _toggleTimerButtonPressed() {
    const tourney = this.props.getTournament.Tournament
    this.props.updateTournamentTimerMutation(
      { variables: {
        id: tourney.timer.id,
        now: new Date(), 
        active: !tourney.timer.active,
        tournamentId: tourney.id,
        elapsed: tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - new Date(tourney.timer.updatedAt).valueOf() : 0)
        } 
      }
    )
  }

  _resetTimerButtonPressed() {
    const tourney = this.props.getTournament.Tournament
    this.props.updateTournamentTimerMutation(
      { variables: {
        id: tourney.timer.id,
        now: new Date(), 
        active: false,
        tournamentId: tourney.id,
        elapsed: 0
        } 
      }
    )
  }

  _changeNameButtonPressed() {
    this.props.changeTitleMutation(
      {
        variables: {
          "id": this.props.getTournament.Tournament.id,
          "newTitle": "Tournament name updated on " + new Date().toString()
        }
      }
    )
  }

  render() {
    const { getTournament: { loading, error, Tournament } } = this.props;
    if (loading) {
      return (<Text>Loading...</Text>)
    } else if (error) {
      return(<Text>Error!</Text>)
    } else {
      return (
        <View style={{flex: 1, paddingTop: 22}}>
          <Modal
            animationType='slide'
            transparent={false}
            visible={this.state.modalVisible}
          >
            <View style={{backgroundColor: '#060'}}>
              <Text>{"\n"}{"\n"}{"\n"}{"\n"}</Text>
              <Button title="close" onPress={this._closeButtonPressed.bind(this)}></Button>
            </View>
          </Modal>
          <Text>
            {Tournament.title}{"\n\n"}
            {Tournament.segments.length} Levels, starting at BB={Tournament.segments[0].bBlind}{"\n\n"}
            {this._timeRemaining().display}{"\n\n"}
            {this._timeRemaining().csi}{"\n\n"}
            {this._timeRemaining().segment.sBlind} / {this._timeRemaining().segment.bBlind}{"\n\n"}
            Timer Status: {Tournament.timer.active ? "Running" : "Stopped"}{"\n\n"}
            Timer Elapsed (Previously): {Tournament.timer.elapsed}{"\n\n"}
          </Text>
          <TouchableHighlight onPress={this._toggleTimerButtonPressed.bind(this)}>
            <Text>Start/Stop{"\n\n"}</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this._resetTimerButtonPressed.bind(this)}>
            <Text>Reset Timer{"\n\n"}</Text>
          </TouchableHighlight>
          <TouchableHighlight onPress={this._changeNameButtonPressed.bind(this)}>
            <Text>Update Name{"\n\n"}</Text>
          </TouchableHighlight>
        </View>
      )
    }
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournament', }),
  graphql(currentUserQuery, { name: 'currentUser', }),
  graphql(updateTournamentTimer, {name: 'updateTournamentTimerMutation'}),
  graphql(changeTitle, { name: 'changeTitleMutation'}),
)(TournamentDetailsScreen)