import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { List, ListItem, Button, } from 'react-native-elements';
import { currentUserQuery, getTournamentSegmentsQuery, createTournamentSegmentMutation, deleteSegmentMutation} from '../constants/GQL'
import { sortSegments, sortChips } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'

class SegmentListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      user: null,
      creating: false,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshSegmentList', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      this.setState({user: nextProps.currentUserQuery.user || null})
    }
  }
  
  componentDidUpdate(prevProps) {
  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refreshButtonPressed() {
    this.props.getTournamentSegmentsQuery.refetch()
  }

  _addButtonPressed(location, existingSegment) {
    this.setState({creating: true})
    this.props.createTournamentSegmentMutation(
      {
        variables:
        {
          "tournamentId": this.props.getTournamentSegmentsQuery.Tournament.id,
          "sBlind": 0,
          "bBlind": 0,
          "duration": existingSegment.duration || 20,
        }
      }
    ).then((result) => {
      this._refreshButtonPressed()
      this.setState({creating: false})
      this._navigateToSegmentEdit(result.data.createSegment.id)
    }
    )
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
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {

      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const segments = sortSegments(Tournament.segments)

      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <View style={{marginTop: 5}}>
            {this.state.user && !this.state.creating && <Button buttonStyle={{backgroundColor: "green"}} onPress={this._addButtonPressed.bind(this, "before", segments[0])} icon={{name: 'playlist-add'}} title="New"></Button>}
            {this.state.user && this.state.creating && <ActivityIndicator/>}
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
                    title={(item.sBlind || 0) + "/" + (item.bBlind || 0) + (item.ante ? " + " + item.ante + " ante" : "")}
                    subtitle={item.duration + " minutes"}
                    onPress={this._navigateToSegmentEdit.bind(this, item.id)}
                  />
                  </Swipeout>
                ))
              }
            </List>
          </ScrollView>
          <BannerAd/>
        </View>
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