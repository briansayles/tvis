import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { List, ListItem, Button, } from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getTournamentSegmentsQuery, createTournamentSegmentMutation, deleteSegmentMutation} from '../constants/GQL'
import { sortSegments, sortChips } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'

class SegmentListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formData: {},
      refreshing: false,
      user: null,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshSegmentList', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      // const user = nextProps.currentUserQuery.user || null
      this.setState({user: nextProps.currentUserQuery.user || null})
    }
    if (nextProps.getTournamentSegmentsQuery) {
      this.setState({formData: nextProps.getTournamentSegmentsQuery.Tournament || null})
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

  _addButtonPressed(location, existingSegment) {
  	var sBlind, bBlind, duration
  	if (location == "before") {
  		sBlind = parseInt(existingSegment.sBlind / 2)
  		bBlind = 2 * sBlind
  		duration = existingSegment.duration
  	} else {
  		sBlind = existingSegment.sBlind * 2
  		bBlind = 2 * sBlind
  		duration = existingSegment.duration
  	}

    this.props.createTournamentSegmentMutation(
      {
        variables:
        {
          "tournamentId": this.props.getTournamentSegmentsQuery.Tournament.id,
          "sBlind": sBlind,
          "bBlind": bBlind,
          "duration": duration,
        }
      }
    ).then(() => this._refreshButtonPressed()).then(() => alert('Segment added'))
  }

	_navigateToSegmentEdit(id) {
    this.props.navigation.navigate('SegmentEdit', {id: id})
  }

  _deleteSegmentButtonPressed(id) {
    // const tournamentId = this.props.getSegmentQuery.Segment.tournament.id
    this.props.deleteSegmentMutation({variables: {id: id} }).then(
      () => Events.publish('RefreshSegmentList')
    )
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
          {this.state.user && <Button style={{flex:-1}} onPress={this._addButtonPressed.bind(this, "before", segments[0])} icon={{name: 'playlist-add'}} title="Add"></Button>}
          <List>
            {
              segments.map((item, i) => (
                <Swipeout
                  key={i}
                  autoClose={true}
                  right={[
                    {
                      text: 'Edit',
                      onPress: this._navigateToSegmentEdit.bind(this, item.id),
                      type: 'primary',
                    },
                    {
                      text: 'DELETE',
                      onPress: this._deleteSegmentButtonPressed.bind(this, item.id),
                      backgroundColor: '#ff0000',
                      type: 'delete',
                    },
                  ]}
                >
                <ListItem
                  title={item.duration + " minutes: " + item.sBlind + "/" + item.bBlind + (item.ante ? " + " + item.ante + " ante" : "")}
                  onPress={this._navigateToSegmentEdit.bind(this, item.id)}
                />
                </Swipeout>
              ))
            }
          </List>
          {userIsOwner && <Button style={{flex:-1}} onPress={this._addButtonPressed.bind(this, "after", segments[segments.length - 1])} icon={{name: 'playlist-add'}} title="Add"></Button>}
          <Text>{"\n"}</Text>
        </ScrollView>
      )
    }
  }
}

export default compose(
  graphql(getTournamentSegmentsQuery, { name: 'getTournamentSegmentsQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(createTournamentSegmentMutation, {name: 'createTournamentSegmentMutation'}),
  graphql(deleteSegmentMutation, {name: 'deleteSegmentMutation'}),
)(SegmentListScreen)