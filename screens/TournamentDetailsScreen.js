import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import Expo from 'expo';
import {client} from '../main';

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
      timer {
        id
        active
        updatedAt
        elapsed
      }
      segments {
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

const createTimer = gql`
  mutation createTournamentTimer($tournamentId: ID!) {
    createTimer(tournamentId: $tournamentId, active: true) {
      id
      active
      updatedAt
    }
  }
`

const updateTimer = gql`
  mutation updateTournamentTimer($id: ID!, $active: Boolean) {
    updateTimer(id: $id, active: $active) {
      id
    }
  }
`

class TournamentDetailsScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
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
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible});
  }

  _toggleTimerButtonPressed() {
    if (this.props.getTournament.Tournament.timer==null) {
      alert ('creating timer for tournamnet with id=' + this.props.getTournament.Tournament.id)
      this.props.createTimerMutation({variables: {tournamentId: this.props.getTournament.Tournament.id} })
    } else {
      alert('updating timer to ' + !this.props.getTournament.Tournament.timer.active)
      this.props.updateTimerMutation({variables: {id: this.props.getTournament.Tournament.timer.id, active: !this.props.getTournament.Tournament.timer.active} })
    }
    this.props.getTournament.refetch()
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
            {Tournament.timer ? 
              Tournament.timer.id + "\n\n" +
              Tournament.timer.active + "\n\n" +
              Tournament.timer.updatedAt
              : 
              "No Timer Set Yet"
            }
          </Text>
          <TouchableHighlight onPress={this._toggleTimerButtonPressed.bind(this)}>
            <Text>Start/Stop</Text>
          </TouchableHighlight>
        </View>
      )
    }
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournament', }),
  graphql(currentUserQuery, { name: 'currentUser', }),
  graphql(createTimer, {name: 'createTimerMutation'}),
  graphql(updateTimer, {name: 'updateTimerMutation'}),
)(TournamentDetailsScreen)