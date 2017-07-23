import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import Expo, { KeepAwake } from 'expo';
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
    },100);
  }

  componentWillUnmount () {
    clearInterval(this.clockInterval)
  }

  _timerCalcs() {
    if (this.props.getTournament.loading || this.props.getTournament.error) {return}
    const msPerMinute = 60 * 1000
    const tourney = this.props.getTournament.Tournament
    const segments = tourney.segments
    const timer = tourney.timer
    const totalElapsedMS = timer.active ? timer.elapsed + this.state.time.valueOf() - new Date(timer.updatedAt).valueOf() : timer.elapsed
    var cumulativeMS = 0
    var currentSegmentIndex = null
    for (var i = 0, len = segments.length; i < len; i++) {
      if (totalElapsedMS >= cumulativeMS && totalElapsedMS < (cumulativeMS + segments[i].duration * msPerMinute)) {
        currentSegmentIndex = i
        break
      }
      cumulativeMS += segments[i].duration * msPerMinute
    }

    if(currentSegmentIndex==null) {
      return {
        display: "00:00",
        segment: segments[segments.length-1],
        csi: segments.length-1,
        currentDuration: segments[segments.length-1].duration,
        totalDuration: cumulativeMS,
        percentage: 0,
      }
    }
    const duration = cumulativeMS + segments[currentSegmentIndex].duration * msPerMinute
    const ms = duration - totalElapsedMS
    return {
      display: msToTime(ms),
      segment: segments[currentSegmentIndex],
      csi: currentSegmentIndex,
      currentDuration: segments[currentSegmentIndex].duration, 
      totalDuration: duration,
      percentage: ms/(segments[currentSegmentIndex].duration * msPerMinute),
    }
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
    const { getTournament: { loading, error, Tournament } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
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
          <KeepAwake/>
          <Text style={styles.titleText}>{Tournament.title}{"\n"}</Text>
          <Text style={styles.blindsText}>{this._timerCalcs().segment.sBlind} / {this._timerCalcs().segment.bBlind}</Text>
          <Text style={styles.timerText}>{this._timerCalcs().display} / {msToTime(this._timerCalcs().currentDuration * 60 * 1000)}</Text>
          <Button onPress={this._toggleTimerButtonPressed.bind(this)} title="start/stop"></Button>
          <Button onPress={this._resetTimerButtonPressed.bind(this)} title="Reset"></Button>
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

const styles = StyleSheet.create({
  titleText: {
    fontSize: 12,
    textAlign: 'center'
  },
  blindsText: {
    fontSize: 30,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 40,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 20,
    color: 'rgba(96,100,109,1)',
    lineHeight: 30,
    textAlign: 'center'
  }
});
