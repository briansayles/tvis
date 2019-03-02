import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { Text, ListItem, Card, Button, Avatar, Icon, Divider} from 'react-native-elements';
import { currentUserQuery, getTournamentQuery, } from '../constants/GQL'
import { smallestChipArray, sortSegments, sortChips, sortEntryFees, numberToSuffixedString, responsiveFontSize, responsiveWidth, responsiveHeight, dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import { BannerAd } from '../components/Ads'

class TournamentEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      user: null,
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.setState({user: this.props.currentUserQuery.user})
    this.refreshEventSubscription = Events.subscribe('RefreshEditor', () => this._onRefresh())
  }
 
  componentWillUnmount () {
    this.refreshEventSubscription.remove()
  }

  _onRefresh = async () => {
    this.setState({refreshing: true})
    await this.props.getTournamentQuery.refetch()
    this.setState({refreshing: false})
  }

  _navigateToTimerButtonPressed(id) {
    this.props.navigation.navigate('Details', {id: id})
  }

  _navigateToTimerEditorButtonPressed(timer) {
    this.props.navigation.navigate('TimerEdit', {timer: timer})
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

  _navigateToGeneralInfoEdit(tourney) {
    this.props.navigation.navigate('GeneralInfoEdit', {tourney: tourney})
  }

  _navigateToCostList(id) {
    this.props.navigation.navigate('CostList', {id: id})
  }

  _navigateToBuyList(id) {
    this.props.navigation.navigate('BuyList', {id: id})
  }

  _navigateToPayoutLevelList(id) {
    this.props.navigation.navigate('PayoutSetup', {id: id})
  }

  render() {
    const { getTournamentQuery: { loading, error, Tournament } } = this.props
    const editButtonColor = dictionaryLookup("editButtonColor")
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const segments = sortSegments(Tournament.segments)
      const chips = sortChips(Tournament.chips)
      const smallestChipReq = smallestChipArray(chips, segments)
      const fees = sortEntryFees(Tournament.costs)
      const payoutLevels = Tournament.payoutLevels
      var totalChipStack = 0
      var totalCost = 0
      for (var i = 0, len = fees.length; i < len; i++) {
        totalChipStack+=fees[i].chipStack*Tournament.costs[i]._buysMeta.count
        totalCost+=fees[i].price*Tournament.costs[i]._buysMeta.count
      }
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ScrollView style={{flex: 1}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
          >
            <Card
              title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                {userIsOwner && <Text style={{flex: 1}}></Text> }
                <Text style={[styles.cardTitle, {flex: 6, textAlign: 'center'}]}>Tournament Timer</Text>
                {userIsOwner && 
                  <Icon style={{flex: 1}} name='edit' type='font-awesome' onPress={this._navigateToTimerEditorButtonPressed.bind(this, Tournament.timer)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                }
              </View> }
            >
              <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
                <Button 
                  icon={<Icon
                    name='ios-timer'
                    color='white'
                    type='ionicon'
                  />}
                  buttonStyle={{ flex: 1, borderRadius: 10, backgroundColor: '#080', paddingLeft: 10}}
                  title='Timer'
                  titleStyle={{fontSize: 24, color: '#fff'}}
                  onPress={this._navigateToTimerButtonPressed.bind(this, Tournament.id)}
                />
              </View>
            </Card>

            <Card
              title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                {userIsOwner && <Text style={{flex: 1}}></Text> }
                <Text style={[styles.cardTitle, {flex: 6, textAlign: 'center'}]}>Chip Denominations</Text>
                {userIsOwner && 
                  <Icon style={{flex: 1}} name='edit' type='font-awesome' onPress={this._navigateToChipList.bind(this, Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                }
              </View> }
            >
              <View style={{flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#eee', paddingTop: 3, paddingBottom: 3}}>
                {chips.map((u,i) => {
                  return (
                    <View key={i} style={{flexDirection: 'column', justifyContent:'center', alignItems: 'center'}}>
                      <Icon name='circle' color={u.color} type='font-awesome' size={responsiveFontSize(6)}/>
                      <Text style={[styles.chipText]} >{numberToSuffixedString(u.denom)}</Text>
                    </View>
                  )
                })}
              </View>
            </Card>

            <Card 
              title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                {userIsOwner && <Text style={{flex: 1}}></Text> }
                <Text style={[styles.cardTitle, {flex: 6, textAlign: 'center'}]}>{Tournament.title}</Text>
                {userIsOwner && 
                  <Icon style={{flex: 1}} name='edit' type='font-awesome' onPress={this._navigateToGeneralInfoEdit.bind(this, Tournament)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                }
              </View> }
            >
              <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={[styles.title, {}]}>{Tournament.subtitle ? Tournament.subtitle.toString() + "\n" : ""}</Text>
                <Text style={[styles.title, {}]}>{dictionaryLookup(Tournament.game.toString(), "GameOptions", "long") + "\n"}</Text>
                <Text style={[styles.title, {}]}>{Tournament.comments ? Tournament.comments.toString() : ''}</Text>
              </View>
            </Card>

            <Card
              title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                {userIsOwner && <Text style={{flex: 1}}></Text> }
                <Text style={[styles.cardTitle, {flex: 6, textAlign: 'center'}]}>Buy Ins</Text>
                {userIsOwner && 
                  <Icon style={{flex: 1}} name='edit' type='font-awesome' onPress={this._navigateToBuyList.bind(this, Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                }
              </View> }
            >
              <View key={i} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={[styles.title, {flex: 3}]}>
                  {(totalCost).toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true})}
                </Text>
                <Text style={[styles.title, {flex: 3}]}>
                  {(totalChipStack).toLocaleString(undefined, {style: 'decimal', maximumFractionDigits: 0, useGrouping: true})}
                </Text>
              </View>
            </Card>

            <Card
              title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                {userIsOwner && <Text style={{flex: 1}}></Text> }
                <Text style={[styles.cardTitle, {flex: 6, textAlign: 'center'}]}>Payout Setup</Text>
                {userIsOwner && 
                  <Icon style={{flex: 1}} name='edit' type='font-awesome' onPress={this._navigateToPayoutLevelList.bind(this, Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                }
              </View> }
            >
              <View style={{flexDirection: 'column', justifyContent: 'space-around', paddingTop: 3, paddingBottom: 3}}>
                {
                  payoutLevels.map((u, i) => {
                    return (
                      <View key={i} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={{}}>
                          {u.levelNumber}
                        </Text>
                      </View>
                    )
                  })
                }
              </View>
            </Card>

            <Card
              title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                {userIsOwner && <Text style={{flex: 1}}></Text> }
                <Text style={[styles.cardTitle, {flex: 6, textAlign: 'center'}]}>Entry Fees</Text>
                {userIsOwner && 
                  <Icon style={{flex: 1}} name='edit' type='font-awesome' onPress={this._navigateToCostList.bind(this, Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                }
              </View> }
            >
              <View style={{flexDirection: 'column', justifyContent: 'space-around', paddingTop: 3, paddingBottom: 3}}>
                {
                  fees.map((u, i) => {
                    return (
                      <View key={i} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                        <Text style={[styles.title, {flex: 3}]}>
                          {u.price && u.price.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true}) + "\n" + 
                          (dictionaryLookup(u.costType.toString(), "EntryFeeOptions", "long") || "")}
                        </Text>
                        <Icon style={[{flex: 1}]} name="arrow-right" type="font-awesome"/> 
                        <Text style={[styles.title, {flex: 3}]}>
                          {u.chipStack && u.chipStack.toLocaleString(undefined, {style: 'decimal', maximumFractionDigits: 0, useGrouping: true}) + " Tournament Chips."}
                        </Text>
                      </View>
                    )
                  })
                }
              </View>
            </Card>

            <Card
              title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
                {userIsOwner && <Text style={{flex: 1}}></Text> }
                <Text style={[styles.cardTitle, {flex: 6, textAlign: 'center'}]}>Blinds Schedule</Text>
                {userIsOwner && 
                  <Icon style={{flex: 1}} name='edit' type='font-awesome' onPress={this._navigateToSegmentList.bind(this, Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                }
              </View> }
            >
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[styles.title, {flex: 2, textDecorationLine: 'underline'}]}>Minutes</Text>
                <Text style={[styles.title, {flex: 2, textDecorationLine: 'underline'}]}>Small Blind</Text>
                <Text style={[styles.title, {flex: 2, textDecorationLine: 'underline'}]}>Big Blind</Text>
                <Text style={[styles.title, {flex: 1, textDecorationLine: 'underline'}]}>Ante</Text>
              </View>
              <View style={{flexDirection: 'column', justifyContent: 'space-around', paddingTop: 3, paddingBottom: 3}}>              
                {
                  segments.map((u, i) => {
                    return (
                      <View key={i} style={{flexDirection: 'column'}}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                          <Text style={[styles.title, {flex: 2}]}>{u.duration.toString()}</Text>
                          <Text style={[styles.title, {flex: 2}]}>{u.sBlind ? numberToSuffixedString(u.sBlind) : ''}</Text>
                          <Text style={[styles.title, {flex: 2}]}>{u.bBlind ? numberToSuffixedString(u.bBlind) : ''}</Text>
                          <Text style={[styles.title, {flex: 1}]}>{u.ante ? numberToSuffixedString(u.ante) : ''}</Text>
                        </View>
                        { smallestChipReq.map((s, si) => {
                          if (s.segment === i && i < segments.length -1 ) {
                            return (
                              <View key={si} style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                <Text style={[styles.title, {flex: 2, color: s.color != "#fff" ? s.color : "#000"}]}>Color Up {s.denom.toString()}'s ({dictionaryLookup(s.color, "ChipColorOptions", "long")})</Text>
                              </View>
                            )
                          }
                        }) }
                      </View>
                    )
                  })
                }
              </View>
            </Card>

          </ScrollView>
          <BannerAd/>
        </View>
      )
    }
  }
}
export default compose(
  graphql(getTournamentQuery, { name: 'getTournamentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
)(TournamentEditScreen)

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: responsiveFontSize(2.25),
    fontWeight: 'bold'
  },
  title: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
  },
  editButton: {
  },
  chipText: {
    fontSize: responsiveFontSize(3),
  },
});