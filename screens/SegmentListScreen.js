import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, } from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getTournamentSegmentsQuery, changeTitleMutation, deleteTournamentMutation, updateTournamentMutation, tournamentSubscription} from '../constants/GQL'
import { sortSegments, sortChips } from '../utilities/functions'
import Events from '../api/events'

class SegmentListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formData: {},
      refreshing: false,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshSegmentList', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getTournamentSegmentsQuery) {
      this.setState({formData: nextProps.getTournamentSegmentsQuery.Tournament})
      console.log('getTournamentSegments props received' + JSON.stringify(this.state.formData))
    }
  }
  
  componentDidUpdate(prevProps) {

  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refreshButtonPressed() {
    this.props.getTournamentSegmentsQuery.refetch()
    // alert('Editor refreshed')
  }
  _navigateToSegmentEdit(id) {
    this.props.navigation.navigate('SegmentEdit', {id: id})
  }
  render() {
    const { getTournamentSegmentsQuery: { loading, error, Tournament } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const segments = sortSegments(Tournament.segments)
      return (
        <ScrollView style={{flex: 1, paddingTop: 22, paddingBottom: 30}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._refreshButtonPressed.bind(this)}
            />
          }
        >
          <List>
            {
              segments.map((item, i) => (
                <ListItem
                  key={i}
                  title={item.duration + " minutes: " + item.sBlind + "/" + item.bBlind + (item.ante ? " + " + item.ante + " ante" : "")}
                  onPress={this._navigateToSegmentEdit.bind(this, item.id)}
                />
              ))
            }
          </List>
          <Text>{"\n"}</Text>
        </ScrollView>
      )
    }
  }
}

export default compose(
  graphql(getTournamentSegmentsQuery, { name: 'getTournamentSegmentsQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(SegmentListScreen)