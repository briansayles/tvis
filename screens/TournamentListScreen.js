import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import Expo from 'expo';
import {client} from '../main';
import Tournaments from './Tournaments';

const currentUser = gql`
  query currentUser {
      user {
          id
          name
      }
  }
`
const allTournaments = gql`
  query allTournaments {
    allTournaments (orderBy: updatedAt_DESC) {
      id
      title
    }
  }
`
const createTournament = gql`
  mutation createTournament($title: String, $userId: ID) {
    createTournament (
      userId: $userId
      title:$title
      game:NLHE
      timer: {
        active: false
        elapsed: 0
      }
      segments: [
        {
          sBlind:10
          bBlind:20
          duration:1
        }
        {
          sBlind:15
          bBlind:30
          duration:2
        }
        {
          sBlind:20
          bBlind:40
          duration:1
        }      {
          sBlind:25
          bBlind:50
          duration:2
        }      {
          sBlind:50
          bBlind:100
          duration:1
        }      
        {
          sBlind:75
          bBlind:150
          duration:2
        }
      ]
      chips: [
        {
          color:"#f00"
          denom:5
        }
        {
          color:"#0f0"
          denom:25
        }
        {
          color:"#000"
          denom:100
        }
      ]
    )
    {
      id
      title
      game
      segments {
        sBlind
        duration
      }
      user {
        name
      }
    }
  }
`
const deleteTournament = gql`
  mutation deleteTournament($id: ID!) {
    deleteTournament(id: $id) {
      id
    }
  }
`

class TournamentListScreen extends React.Component {

  static navigationOptions = {
    title: "Tournaments"
  };
  

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      user: null,
    }
  }

  componentDidMount() {
    client.query({query: currentUser}).then(
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

    // Subscribe to `CREATED`-mutations
    this.createTournamentSubscription = this.props.allTournamentsQuery.subscribeToMore({
      document: gql`
        subscription {
          Tournament(filter: {
            mutation_in: [CREATED]
          }) {
            node {
              id
              title
            }
          }
        }
      `,
      updateQuery: (previous, {subscriptionData}) => {
        this.props.allTournamentsQuery.refetch()
        return
        const newAlltournaments = [
          subscriptionData.data.Tournament.node,
          ...previous.allTournaments
        ]
        const result = {
          ...previous,
          allTournaments: newAlltournaments
        }
        return result
      },
      onError: (err) => {
        console.error(err)
      },
    });
  }


  componentDidUpdate(prevProps) {
    if (prevProps.allTournamentsQuery.allTournaments !== this.props.allTournamentsQuery.allTournaments && this.endRef) {
      this.endRef.scrollIntoView()
    }
  }

  _addButtonPressed() {
    this.props.createTournamentMutation(
      {
        variables:
        {
          "title": "Tournament created on " + new Date().toString(),
          "userId": this.state.user.id,
        }
      }
    )
 }


  _refreshButtonPressed() {
    this.props.allTournamentsQuery.refetch()
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible});
  }

  _routeToDetails(id) {
      this.props.navigator.push('tournamentDetails', {id: id})
  }

  _deleteTournament = (id) => {
    this.props.deleteTournamentMutation({variables: {id:id} }).then(
    this.props.allTournamentsQuery.refetch())
  }

  render() {
    const { allTournamentsQuery: { loading, error, allTournaments } } = this.props
    if (loading) {
      return (<Text>Loading...</Text>)
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
          <TouchableHighlight onPress={this._refreshButtonPressed.bind(this)}><Text>Refresh{"\n"}</Text></TouchableHighlight>
          <Tournaments
            tournaments={allTournaments || []}
            endRef={this._endRef}
            deleteTournamentFunction = {this._deleteTournament.bind(this)}
            routeToDetailsFunction = {this._routeToDetails.bind(this)}
          />
          <TouchableHighlight onPress={this._addButtonPressed.bind(this)}><Text>Add Tournament</Text></TouchableHighlight>
        </View>
      )
    }
  }

  _endRef = (element) => {
    this.endRef = element
  }
}

export default compose(
  graphql(allTournaments, { name: 'allTournamentsQuery' }),
  graphql(createTournament, { name: 'createTournamentMutation'}),
  graphql(currentUser, { name: 'currentUserQuery' }),
  graphql(deleteTournament, { name: 'deleteTournamentMutation' }),
)(TournamentListScreen)