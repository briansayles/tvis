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
  query getTournament($id:ID) {
    Tournament(id:$id)
    {
      title
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

const allTournamentsQuery = gql`
  query allTournaments {
    allTournaments {
      id
      title
      createdAt
    }
  }
`
class TournamentDetailsScreen extends React.Component {

  constructor(props) {
    super(props)
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})
    this.state = {
      dataSource: ds.cloneWithRows([]),
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

  componentWillReceiveProps(nextProps) {

    // update tournaments
    if (nextProps.getTournament.Tournament) {
      const sortedTournaments = nextProps.fetchAllTournaments.allTournaments.slice()
      sortedTournaments.sort((p1, p2) => new Date(p2.createdAt).getTime() - new Date(p1.createdAt).getTime())

      const tournaments = sortedTournaments.map(tournament => {
        return {
          'tournamentId': tournament.id,
          'description': tournament.title,
        }
      })

      if (!nextProps.fetchAllTournaments.loading && !nextProps.fetchAllTournaments.error) {
        const {dataSource} = this.state
        this.setState({
          dataSource: dataSource.cloneWithRows(tournaments),
        })
      }
    }
  }

  _addButtonPressed() {
    this.props.createTournament(
      {
        variables:
        {
          "title": "app-generated tournament",
          "userId": this.state.user.id,
        }
      }
    )
    // this.setState({modalVisible: true});
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible});
  }

  _onRowSelected = (tournament) => {
    this.props.navigator.push(Router.getRoute('tournamnetDetails', {
      tournament: tournament,
      userId: this.state.user && this.state.user.id,
    }))
  }

  render() {
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
        <ListView
          enableEmptySections={true}
          dataSource={this.state.dataSource}
          renderRow={(tournament) => {
            return (<Text>{tournament.description}</Text>)
          }}
        />
        <TouchableHighlight onPress={this._addButtonPressed.bind(this)}><Text>Add Tournament</Text></TouchableHighlight>
      </View>
    )
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournament' }),
  graphql(currentUserQuery, { name: 'currentUser' }),
)(TournamentListScreen)
