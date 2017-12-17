import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { List, ListItem, Card, Button} from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getTournamentQuery, changeTitleMutation, deleteTournamentMutation, updateTournamentMutation, tournamentSubscription} from '../constants/GQL'
import { sortSegments, sortChips } from '../utilities/functions'
import Events from '../api/events'

class TournamentEditScreen extends React.Component {

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
    this.refreshEvent = Events.subscribe('RefreshEditor', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      const user = nextProps.currentUserQuery.user || null
      this.setState({user: user})
    }
    if (nextProps.getTournamentQuery) {
      this.setState({formData: nextProps.getTournamentQuery.Tournament || null})
    }
  }
  
  componentDidUpdate(prevProps) {
  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _navigateToTimerButtonPressed(id) {
    this.props.navigation.navigate('Details', {id: id})
  }

  _navigateToSegmentList(id) {
    this.props.navigation.navigate('SegmentList', {id: id})
  }

  _navigateToChipList(id) {
    this.props.navigation.navigate('ChipList', {id: id})
  }

  _navigateToTableList(id) {
    this.props.navigation.navigate('TableList', {id: id})
  }

  _navigateToPlayerList(id) {
    this.props.navigation.navigate('PlayerList', {id: id})
  }

  _navigateToCostList(id) {
    this.props.navigation.navigate('CostList', {id: id})
  }

  _navigateToPrizeList(id) {
    this.props.navigation.navigate('PrizeList', {id: id})
  }

  _submitButtonPressed() {
    console.log(JSON.stringify(this.state.formData))
    this.props.updateTournamentMutation(
      {
        variables: {
          "id": this.props.getTournamentQuery.Tournament.id,
          "title": this.state.formData.title,
          "game": this.state.formData.game
        }
      }
    ).then(() => Events.publish('RefreshTournamentList')).then(() => alert('Saved'))
  }

  _deleteTournamentButtonPressed() {
    this.props.deleteTournamentMutation({variables: {id:this.props.getTournamentQuery.Tournament.id} }).then(
      () => Events.publish('RefreshTournamentList')).then(
      () => this.props.navigation.goBack()
    ).then(() => alert ('Nuked it!'))
  }

  handleFormChange(formData){
    this.setState({formData:formData})
    this.props.onFormChange && this.props.onFormChange(formData)
  }

  handleFormFocus(e, component){
  }

  _refreshButtonPressed() {
    this.props.getTournamentQuery.refetch()
  }

  render() {
    const { getTournamentQuery: { loading, error, Tournament } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const segments = sortSegments(Tournament.segments)
      const chips = sortChips(Tournament.chips)
      return (
        <ScrollView style={{flex: 1, paddingTop: 22, paddingBottom: 30}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._refreshButtonPressed.bind(this)}
            />
          }
        >
          <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginBottom: 10}}>
            {userIsOwner && 
              <Button
                style={{flex: 0.5}}
                icon={{name: 'line-chart', type: 'font-awesome'}}
                backgroundColor='#03A9F4'
                fontFamily='Lato'
                buttonStyle={{borderRadius: 10, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Blinds' 
                onPress={this._navigateToSegmentList.bind(this, Tournament.id)}
              />
            }
            {userIsOwner && 
              <Button 
                style={{flex: 0.5}}
                icon={{name: 'ios-disc', type: 'ionicon'}}
                backgroundColor='#03A9F4'
                fontFamily='Lato'
                buttonStyle={{borderRadius: 10, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Chips' 
                onPress={this._navigateToChipList.bind(this, Tournament.id)}>
              </Button>
            }
          </View>
          <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginBottom: 10}}>
            {userIsOwner && 
              <Button
                style={{flex: 0.5}}
                icon={{name: 'event-seat'}}
                backgroundColor='#03A9F4'
                fontFamily='Lato'
                buttonStyle={{borderRadius: 10, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Tables' 
                onPress={this._navigateToTableList.bind(this, Tournament.id)}
              />
            }
            {userIsOwner && 
              <Button 
                style={{flex: 0.5}}
                icon={{name: 'ios-people', type: 'ionicon'}}
                backgroundColor='#03A9F4'
                fontFamily='Lato'
                buttonStyle={{borderRadius: 10, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Players' 
                onPress={this._navigateToPlayerList.bind(this, Tournament.id)}>
              </Button>
            }
          </View>
          <View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-around', marginBottom: 10}}>
            {userIsOwner && 
              <Button
                style={{flex: 0.5}}
                icon={{name: 'ios-pricetags-outline', type: 'ionicon'}}
                backgroundColor='#03A9F4'
                fontFamily='Lato'
                buttonStyle={{borderRadius: 10, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Costs' 
                onPress={this._navigateToCostList.bind(this, Tournament.id)}
              />
            }
            {userIsOwner && 
              <Button 
                style={{flex: 0.5}}
                icon={{name: 'ios-trophy', type: 'ionicon'}}
                backgroundColor='#03A9F4'
                fontFamily='Lato'
                buttonStyle={{borderRadius: 10, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Prizes' 
                onPress={this._navigateToPrizeList.bind(this, Tournament.id)}>
              </Button>
            }
          </View>
          <Card
            title="Tournament Timer"
          >
            <Button 
              icon={{name: 'ios-timer-outline', type: 'ionicon'}}
              backgroundColor='#080'
              fontFamily='Lato'
              fontSize={24}
              buttonStyle={{borderRadius: 20, marginLeft: 0, marginRight: 0, marginBottom: 0}}
              title='Timer' 
              onPress={this._navigateToTimerButtonPressed.bind(this, Tournament.id)}>
            </Button>
          </Card>
          <Form ref='tournamentForm' onFocus={this.handleFormFocus.bind(this)} onChange={this.handleFormChange.bind(this)}>
            <Separator />
            <InputField ref='title' placeholder='Tournament Title' value={Tournament.title}/>
            <PickerField ref='game' placeholder='Game Type' value={Tournament.game} options={{"":"", NLHE: "NL Holdem", PLO: "PotLO"}}/>
          </Form>
          {userIsOwner && <Button title="DELETE THIS TOURNAMENT" onPress={this._deleteTournamentButtonPressed.bind(this)}></Button>}
          {userIsOwner && <Button title="Submit" onPress={this._submitButtonPressed.bind(this)}></Button>}
          <Text>{"\n"}</Text>
        </ScrollView>
      )
    }
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournamentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(deleteTournamentMutation, { name: 'deleteTournamentMutation' }),
  graphql(updateTournamentMutation, { name: 'updateTournamentMutation'}),
)(TournamentEditScreen)

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
  blindsNoticeText: {
    fontSize: 45,
    color: 'rgba(200, 0, 0, 1)',
    lineHeight: 50,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 20,
    color: 'rgba(96,100,109,1)',
    lineHeight: 30,
    textAlign: 'center'
  }
});