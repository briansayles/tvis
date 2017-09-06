import {graphql, compose} from 'react-apollo'
import React from 'react'
import {Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import {List, ListItem, Button} from 'react-native-elements'
import {currentUserQuery, currentUserTournamentsQuery, createTournamentMutation, } from '../constants/GQL'
import {Auth} from '../components/Auth'

class TournamentListScreen extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      user: null,
      refreshing: false,
    }
  }

  static navigationOptions = {

  }

  componentDidMount() {
    console.log('didmount')
    // Subscribe to `CREATED`-mutations
    // this.tournamentsSubscription = this.props.currentUserTournamentsQuery.subscribeToMore({
    //   document: allTournamentsSubscription,
    //   updateQuery: (previous, {subscriptionData}) => {
    //     this.props.currentUserTournamentsQuery.refetch()
    //     return
    //     const newAlltournaments = [
    //       subscriptionData.data.Tournament.node,
    //       ...previous.allTournaments
    //     ]
    //     const result = {
    //       ...previous,
    //       allTournaments: newAlltournaments
    //     }
    //     return result
    //   },
    //   onError: (err) => {
    //     console.error(err)
    //   },
    // })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
      this.props.currentUserTournamentsQuery.refetch()
    }
  }

  componentDidUpdate(prevProps) {
    // if (prevProps.currentUserTournamentsQuery.allTournaments !== this.props.currentUserTournamentsQuery.allTournaments && this.endRef) {
    //   this.endRef.scrollIntoView()
    // }
  }

  _addButtonPressed() {
    this.props.createTournamentMutation(
      {
        variables:
        {
          "userId": this.props.currentUserQuery.user.id,
        }
      }
    )
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

  render() {
    const { currentUserTournamentsQuery: { loading, error, user } } = this.props
    if (loading) {
      return <Text>Loading...</Text>
    } else if (error) {
      return (<Text>{error.message}</Text>)
    } else if (user === null) {
      return <Text>need to login</Text>
    } else {
      return (
        <ScrollView 
          style={{flex: 1, marginLeft: 5, marginRight: 5}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._refreshButtonPressed.bind(this)}
            />
          }
        >
          {this.state.user && <Button style={{flex:-1}} onPress={this._addButtonPressed.bind(this)} icon={{name: 'playlist-add'}} title="New"></Button>}
          <List>
            {
              user.tournaments.map((item, i) => (
                <ListItem
                  key={i}
                  title={item.title}
                  onPress={this._navigateToEdit.bind(this, item.id)}
                />
                )
              )
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
  graphql(currentUserTournamentsQuery, { name: 'currentUserTournamentsQuery' }),
  graphql(createTournamentMutation, { name: 'createTournamentMutation'}),
)(TournamentListScreen)