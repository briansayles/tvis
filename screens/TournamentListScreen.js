import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import {List, ListItem, Button} from 'react-native-elements'
import Expo from 'expo'
import {client} from '../main'
import Tournaments from './Tournaments'
import {currentUserQuery, allTournamentsQuery, createTournamentMutation, allTournamentsSubscription} from '../constants/GQL'

class TournamentListScreen extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      user: null,
    }
  }

  static navigationOptions = {

  }

  componentDidMount() {
    // Subscribe to `CREATED`-mutations
    this.tournamentsSubscription = this.props.allTournamentsQuery.subscribeToMore({
      document: allTournamentsSubscription,
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
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
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
          "title": "Tournament #" + (this.props.allTournamentsQuery.allTournaments.length + 1),
          "userId": this.props.currentUserQuery.user.id,
          "duration": 12,
        }
      }
    )
  }

  _refreshButtonPressed() {
    this.props.allTournamentsQuery.refetch()
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

  render() {
    const { allTournamentsQuery: { loading, error, allTournaments } } = this.props
    if (loading) {
      return (<Text>Loading...</Text>)
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      return (
        <ScrollView style={{flex: 1, marginLeft: 5, marginRight: 5}}>
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
          {this.state.user && <Button style={{flex:-1}} onPress={this._addButtonPressed.bind(this)} icon={{name: 'playlist-add'}} title="New"></Button>}
          <List>
            {
              allTournaments.map((item, i) => (
                <ListItem
                  key={i}
                  title={item.title}
                  leftIcon={{name: item.icon}}
                  onPress={this._navigateToEdit.bind(this, item.id)}
                />
              ))
            }
          </List>
          <Text>{"\n"}</Text>
        </ScrollView>
      )
    }
  }

  _endRef = (element) => {
    this.endRef = element
  }
}

export default compose(
  graphql(currentUserQuery, { name: 'currentUserQuery' }),
  graphql(allTournamentsQuery, { name: 'allTournamentsQuery' }),
  graphql(createTournamentMutation, { name: 'createTournamentMutation'}),
)(TournamentListScreen)