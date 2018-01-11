import {graphql, compose} from 'react-apollo'
import React from 'react'
import { View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { Text, List, ListItem, Card, Button, Avatar, Icon} from 'react-native-elements';
// import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getTournamentQuery, changeTitleMutation, tournamentSubscription} from '../constants/GQL'
import { sortSegments, sortChips, numberToSuffixedString } from '../utilities/functions'
import Events from '../api/events'
import dict from '../constants/Dictionary'

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
    // this.updateTournamentSubscription = this.props.getTournamentQuery.subscribeToMore({
    //   document: tournamentSubscription,
    //   updateQuery: (previous, {subscriptionData}) => {
    //     this.props.getTournamentQuery.refetch()
    //     return
    //   },
    //   onError: (err) => {
    //     console.error(err)
    //   },
    // })
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
        <ScrollView style={{flex: 1}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._refreshButtonPressed.bind(this)}
            />
          }
        >
          <Card title={Tournament.title} titleStyle={{fontSize: 34}} flexDirection='column'>
            <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Text h3>{dict[Tournament.game] + "\n"}</Text>
              <Text h4 style={{textAlign: 'center'}}>
                {Tournament.comments ? Tournament.comments.toString() : ''} 
              </Text>
            </View>
            {userIsOwner && 
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Icon name='edit' type='font-awesome' onPress={this._navigateToCostList.bind(this, Tournament.id)} color={dict.editButtonColor} reverse/>
              </View>
            }
          </Card>

          <Card
          >
            {
              Tournament.costs.map((u, i) => {
                return (
                  <View key={i} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                    <Text h4 style={{flex: 3, textAlign: 'center'}}>
                      {u.price.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true}) + " " + 
                      dict[u.costType.toString()]}
                    </Text>
                    <Icon style={{flex: 1, textAlign: 'center'}} name="arrow-right" type="font-awesome"/> 
                    <Text h4 style={{flex: 3, textAlign: 'center'}}>
                      {u.chipStack.toLocaleString(undefined, {style: 'decimal', maximumFractionDigits: 0, useGrouping: true}) + " Tournament Chips.\n"}
                    </Text>
                  </View>
                )
              })
            }
            {userIsOwner && 
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Icon name='edit' type='font-awesome' onPress={this._navigateToCostList.bind(this, Tournament.id)} color={dict.editButtonColor} color='#00a' reverse/>
              </View>
            }
          </Card>

          <Card
            title="Tournament Timer"
          >
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
              <Button 
                icon={{name: 'ios-timer-outline', type: 'ionicon'}}
                backgroundColor='#080'
                fontFamily='Lato'
                fontSize={24}
                buttonStyle={{ flex: 1, borderRadius: 20, marginLeft: 0, marginRight: 0, marginBottom: 0}}
                title='Timer' 
                onPress={this._navigateToTimerButtonPressed.bind(this, Tournament.id)}
              />
              <View style={{flex: 1}}>
                <Text>{Tournament.timer.active ? "Running" : "Paused" }</Text>  
              </View>
            </View>
          </Card>

          <Card flexDirection='column'>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text h3 style={{flex: '2', textAlign: 'center', textDecorationLine: 'underline'}}>Minutes</Text>
              <Text h3 style={{flex: '2', textAlign: 'center', textDecorationLine: 'underline'}}>Small Blind</Text>
              <Text h3 style={{flex: '2', textAlign: 'center', textDecorationLine: 'underline'}}>Big Blind</Text>
              <Text h3 style={{flex: '1', textAlign: 'center', textDecorationLine: 'underline'}}>Ante</Text>
            </View>
            {
              Tournament.segments.map((u, i) => {
                return (
                  <View key={i} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <Text h4 style={{flex: '2', textAlign: 'center'}}>{u.duration.toString()}</Text>
                    <Text h4 style={{flex: '2', textAlign: 'center'}}>{u.sBlind ? numberToSuffixedString(u.sBlind) : ''}</Text>
                    <Text h4 style={{flex: '2', textAlign: 'center'}}>{u.bBlind ? numberToSuffixedString(u.bBlind) : ''}</Text>
                    <Text h4 style={{flex: '1', textAlign: 'center'}}>{u.ante ? numberToSuffixedString(u.ante) : ''}</Text>
                  </View>
                )
              })
            }
            {userIsOwner && 
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Icon name='edit' type='font-awesome' onPress={this._navigateToSegmentList.bind(this, Tournament.id)} color={dict.editButtonColor} reverse/>
              </View>
            }
          </Card>

          <Card flexDirection='column'>
            <View style={{flex: '1', flexDirection: 'row', justifyContent: 'space-between'}}>
              {
                Tournament.chips.map((u, i) => {
                  return (
                    <View key={i} style={{flex: '1', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#eee'}}>
                      <Avatar
                        key={i}
                        large
                        rounded
                        title={numberToSuffixedString(u.denom)}
                        titleStyle={{color: u.textColor, fontSize: 20}}
                        activeOpacity={1}
                        overlayContainerStyle={{backgroundColor: u.color}}
                        containerStyle={{flex: 0.2, margin: 10, borderWidth: 4, borderColor: u.rimColor}}
                      />
                    </View>
                  )
                })
              }
            </View>
            {userIsOwner && 
              <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                  <Icon name='edit' type='font-awesome' onPress={this._navigateToChipList.bind(this, Tournament.id)} color={dict.editButtonColor} reverse/>
              </View>
            }
          </Card>
        </ScrollView>
      )
    }
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournamentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
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