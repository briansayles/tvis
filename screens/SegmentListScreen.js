import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { ListItem, Button, } from 'react-native-elements';
import { currentUserQuery, getTournamentSegmentsQuery, createTournamentSegmentMutation, deleteSegmentMutation} from '../constants/GQL'
import { sortSegments, sortChips } from '../utilities/functions'
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/ListHeader'

class SegmentListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      refreshing: false,
      loading: false,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshSegmentList', () => this._refresh())
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

  _refresh() {
    this.props.getData.refetch().then(() => this.setState({loading: false}))
  }

  _addButtonPressed(parentId, duration) {
    this.setState({loading: true})
    this.props.createItem(
      {
        variables:
        {
          "tournamentId": parentId,
          "sBlind": 0,
          "bBlind": 0,
          "duration": duration,
        }
      }
    ).then((result) => {
      Events.publish('RefreshSegmentList')
      this._editButtonPressed(result.data.createSegment.id)
    }
    )
  }

	_editButtonPressed(segment) {
    this.props.navigation.navigate('SegmentEdit', {segment: segment})
  }

  _deleteButtonPressed(id) {
    this.setState({loading: true})
    this.props.deleteItem({variables: {id: id} }).then(
      () => Events.publish('RefreshSegmentList')
    )
  }

  _search(searchText) {
  }

  render() {
    const { getData: { loading, error, Tournament } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const parent = Tournament
      const list = sortSegments(parent.segments)
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ListHeader 
            title="Blinds" 
            showAddButton={this.state.user} 
            loading={this.state.loading} 
            onAddButtonPress={this._addButtonPressed.bind(this, parent.id)}
            // onSearch={this._search}
          />
          <ScrollView 
            style={{flex: 1, marginLeft: 5, marginRight: 5}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._refresh.bind(this)}
              />
            }
          >
            <View>
              {
                list && list.map((item, i) => (
                  <Swipeout
                    key={i}
                    autoClose={true}
                    right={[
                      {
                        text: 'Edit',
                        onPress: this._editButtonPressed.bind(this, item),
                        type: 'primary',
                      },
                      {
                        text: 'DELETE',
                        onPress: this._deleteButtonPressed.bind(this, item.id),
                        backgroundColor: '#ff0000',
                        type: 'delete',
                      },
                    ]}
                  >
                  <ListItem
                    title={(item.sBlind || 0) + "/" + (item.bBlind || 0) + (item.ante ? " + " + item.ante + " ante" : "")}
                    subtitle={item.duration + " minutes"}
                    onPress={this._editButtonPressed.bind(this, item)}
                  />
                  </Swipeout>
                ))
              }
            </View>
          </ScrollView>
          <BannerAd/>
        </View>
      )
    }
  }
}

export default compose(
  graphql(createTournamentSegmentMutation, {name: 'createItem'}),
  graphql(deleteSegmentMutation, {name: 'deleteItem'}),
  graphql(getTournamentSegmentsQuery, { name: 'getData', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(SegmentListScreen)