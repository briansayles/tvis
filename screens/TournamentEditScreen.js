import {graphql, compose} from 'react-apollo'
import React from 'react'
import { ActivityIndicator, View, ScrollView, ListView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { Text, List, ListItem, Card, Button, Avatar, Icon} from 'react-native-elements';
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
    this.refreshEvent = Events.subscribe('RefreshEditor', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      const user = nextProps.currentUserQuery.user || null
      this.setState({user: user})
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

  _navigateToGeneralInfoEdit(id) {
    this.props.navigation.navigate('GeneralInfoEdit', {id: id})
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
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ScrollView style={{flex: 1}}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._refreshButtonPressed.bind(this)}
              />
            }
          >
            <Card title={Tournament.title} titleStyle={[styles.title, {}]} flexDirection='column'>
              <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                <Text style={[styles.title, {}]}>{Tournament.subtitle ? Tournament.subtitle.toString() + "\n" : ""}</Text>
                <Text style={[styles.title, {}]}>{dictionaryLookup(Tournament.game.toString(), "GameOptions", "long") + "\n"}</Text>
                <Text style={[styles.title, {}]}>{Tournament.comments ? Tournament.comments.toString() : ''}</Text>
              </View>
              {userIsOwner && 
                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon name='edit' type='font-awesome' onPress={this._navigateToGeneralInfoEdit.bind(this, Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                </View>
              }
            </Card>
            <Card title="Entry Fee(s)"
            >
              {
                fees.map((u, i) => {
                  return (
                    <View key={i} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={[styles.title, {flex: 3}]}>
                        {u.price && u.price.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true}) + "\n" + 
                        dictionaryLookup(u.costType.toString(), "EntryFeeOptions", "long")}
                      </Text>
                      <Icon style={[{flex: 1}]} name="arrow-right" type="font-awesome"/> 
                      <Text style={[styles.title, {flex: 3}]}>
                        {u.chipStack && u.chipStack.toLocaleString(undefined, {style: 'decimal', maximumFractionDigits: 0, useGrouping: true}) + " Tournament Chips.\n"}
                      </Text>
                    </View>
                  )
                })
              }
              {userIsOwner && 
                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon name='edit' type='font-awesome' onPress={this._navigateToCostList.bind(this, Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                </View>
              }
            </Card>

            <Card
              title="Tournament Timer"
            >
              <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
                <Button 
                  icon={<Icon
                    name='ios-timer-outline'
                    color='white'
                    type='ionicon'
                  />}
                  buttonStyle={{ flex: 1, borderRadius: 20, marginLeft: 0, marginRight: 0, marginBottom: 0, backgroundColor: '#080'}}
                  title='Timer'
                  titleStyle={{fontSize: 24, color: '#fff'}}
                  onPress={this._navigateToTimerButtonPressed.bind(this, Tournament.id)}
                />
              </View>
            </Card>

            <Card
              title="Players and Buys"
            >
              <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
                

              </View>
            </Card>

            <Card title="Blinds Schedule" flexDirection='column'>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={[styles.title, {flex: 2, textDecorationLine: 'underline'}]}>Minutes</Text>
                <Text style={[styles.title, {flex: 2, textDecorationLine: 'underline'}]}>Small Blind</Text>
                <Text style={[styles.title, {flex: 2, textDecorationLine: 'underline'}]}>Big Blind</Text>
                <Text style={[styles.title, {flex: 1, textDecorationLine: 'underline'}]}>Ante</Text>
              </View>
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
              {userIsOwner && 
                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon name='edit' type='font-awesome' onPress={this._navigateToSegmentList.bind(this, Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                </View>
              }
            </Card>
            <Card title="Chip Denominations" flexDirection='column'>
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
              {userIsOwner && 
                <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Icon name='edit' type='font-awesome' onPress={this._navigateToChipList.bind(this, Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(2)}/>
                </View>
              }
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