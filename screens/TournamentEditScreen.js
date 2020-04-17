import {graphql, compose} from 'react-apollo'
import React, {useState} from 'react'
import { ActivityIndicator, View, ScrollView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { Text, ListItem, Card, Button, Avatar, Icon, Divider} from 'react-native-elements';
import { currentUserQuery, getTournamentQuery, } from '../constants/GQL'
import { smallestChipArray, sortSegments, sortChips, sortEntryFees, numberToSuffixedString, responsiveFontSize, responsiveWidth, responsiveHeight, dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import { BannerAd } from '../components/Ads'
import { useQuery, useMutation, useApollo} from '@apollo/client'

export default ( (props) => {
  const [refreshingState, setRefreshingState] = useState(false)
  const {data, loading: loadingData, error: errorData, client, refetch} = useQuery(getTournamentQuery, {variables: {id: props.navigation.getParam('id')}})
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
  const editButtonColor = dictionaryLookup("editButtonColor")

  const _navigateToTimerButtonPressed = (id) => {
    props.navigation.navigate('Details', {id: id})
  }

  const _navigateToTimerEditorButtonPressed = (id) => {
    props.navigation.navigate('TimerEdit', {id: id})
  }

   const _navigateToSegmentList = (id) => {
    props.navigation.navigate('SegmentList', {id: id})
  }

  const _navigateToChipList = (id) => {
    props.navigation.navigate('ChipList', {id: id})
  }

  const _navigateToTableList = (id) => {
    props.navigation.navigate('TableList', {id: id})
  }

  const _navigateToPlayerList = (id) => {
    props.navigation.navigate('PlayerList', {id: id})
  }

  const _navigateToGeneralInfoEdit = (tourney) => {
    props.navigation.navigate('GeneralInfoEdit', {tourney: tourney})
  }

  const _navigateToCostList = (id) => {
    props.navigation.navigate('CostList', {id: id})
  }

  const _navigateToBuyList = (id) => {
    props.navigation.navigate('BuyList', {id: id})
  }

  const _navigateToPayoutLevelList = (id) => {
    props.navigation.navigate('PayoutSetup', {id: id})
  }

  if (loadingData || loadingUser) {
    return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
  } else if (errorData || errorUser) {
  return <Text>Error! {errorData && errorData.message} {errorUser && errorUser.message}</Text>
  } else {
    const { Tournament } = data
    const { user } = dataUser
    const userIsOwner = user.id === Tournament.user.id
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
              refreshing={refreshingState}
              onRefresh={()=>refetch()}
            />
          }
        >
          <Card
            title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
              {userIsOwner && <Text style={{flex: 1}}></Text> }
              <Text style={[styles.cardTitle, {flex: 10}]}>Tournament Timer</Text>
              {userIsOwner && 
                // <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToTimerEditorButtonPressed(Tournament.timer)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
                <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToTimerEditorButtonPressed(Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
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
                titleStyle={{fontSize: 24}}
                onPress={()=> _navigateToTimerButtonPressed(Tournament.id)}
              />
            </View>
          </Card>

          <Card
            title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
              {userIsOwner && <Text style={{flex: 1}}></Text> }
              <Text style={[styles.cardTitle, {flex: 10}]}>Chip Denominations</Text>
              {userIsOwner && 
                <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToChipList(Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
              }
            </View> }
          >
            <View style={{flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#eee', paddingTop: 3, paddingBottom: 3}}>
              {chips.map((u,i) => {
                return (
                  <View key={i} style={{flexDirection: 'column', justifyContent:'center', alignItems: 'center'}}>
                    <Icon name='poker-chip' color={u.color} type='material-community' size={responsiveFontSize(6)}/>
                    <Text style={styles.chipText}>{numberToSuffixedString(u.denom)}</Text>
                  </View>
                )
              })}
            </View>
          </Card>

          <Card 
            title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
              {userIsOwner && <Text style={{flex: 1}}></Text> }
              <Text style={[styles.cardTitle, {flex: 10}]}>{Tournament.title}</Text>
              {userIsOwner && 
                <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToGeneralInfoEdit(Tournament)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
              }
            </View> }
          >
            <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.title}>{Tournament.subtitle ? Tournament.subtitle.toString() + "\n" : ""}</Text>
              <Text style={styles.title}>{dictionaryLookup(Tournament.game.toString(), "GameOptions", "long") + "\n"}</Text>
              <Text style={styles.title}>{Tournament.comments ? Tournament.comments.toString() : ''}</Text>
            </View>
          </Card>

          <Card
            title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
              {userIsOwner && <Text style={{flex: 1}}></Text> }
              <Text style={[styles.cardTitle, {flex: 10}]}>Buy Ins</Text>
              {userIsOwner && 
                <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToBuyList(Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
              }
            </View> }
          >
            <View key={i} style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
              <Text style={styles.title} containerStyle={{flex: 3}}>
                {(totalCost).toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true})}
              </Text>
              <Text style={styles.title} containerStyle={{flex: 3}}>
                {(totalChipStack).toLocaleString(undefined, {style: 'decimal', maximumFractionDigits: 0, useGrouping: true})} Chips
              </Text>
            </View>
          </Card>

          <Card
            title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
              {userIsOwner && <Text style={{flex: 1}}></Text> }
              <Text style={[styles.cardTitle, {flex: 10}]} >
                Payout Setup
              </Text>
              {userIsOwner && 
                <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToPayoutLevelList(Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
              }
            </View> }
          >
            <View style={{flexDirection: 'column', justifyContent: 'space-around', paddingTop: 3, paddingBottom: 3}}>
              {
                payoutLevels.map((u, i) => {
                  return (
                    <View key={i} style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
                      <Text style={styles.title}>
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
              <Text style={[styles.cardTitle, {flex: 10}]}>Entry Fees</Text>
              {userIsOwner && 
                <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToCostList(Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
              }
            </View> }
          >
              {
                fees.map((u, i) => {
                  return (
                    <View key={i} style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
                      <Text style={styles.title} containerStyle={{flex: 3}}>
                        {u.price && u.price.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true}) + "\n" + 
                        (dictionaryLookup(u.costType.toString(), "EntryFeeOptions", "long") || "")}
                      </Text>
                      <Text style={styles.title} containerStyle={{flex: 3}}>
                        {u.chipStack && u.chipStack.toLocaleString(undefined, {style: 'decimal', maximumFractionDigits: 0, useGrouping: true}) + "\nChips"}
                      </Text>
                    </View>
                  )
                })
              }
          </Card>

          <Card
            title={<View style={{flexDirection: 'row', flex: 1, justifyContent: 'space-between', alignItems: 'center'}}>
              {userIsOwner && <Text style={{flex: 1}}></Text> }
              <Text style={[styles.cardTitle, {flex: 10}]}>Blinds Schedule</Text>
              {userIsOwner && 
                <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToSegmentList(Tournament.id)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
              }
            </View> }
          >
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.blindsHeader}>Minutes</Text>
              <Text style={styles.blindsHeader}>Small Blind</Text>
              <Text style={styles.blindsHeader}>Big Blind</Text>
              <Text style={styles.blindsHeader}>Ante</Text>
            </View>
            <View style={{flexDirection: 'column', justifyContent: 'space-around', paddingTop: 3, paddingBottom: 3}}>              
              {
                segments.map((u, i) => {
                  return (
                    <View key={i} style={{flexDirection: 'column'}}>
                      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                        <Text style={styles.blinds}>{u.duration ? u.duration.toString() : ''}</Text>
                        <Text style={styles.blinds}>{u.sBlind ? numberToSuffixedString(u.sBlind) : ''}</Text>
                        <Text style={styles.blinds}>{u.bBlind ? numberToSuffixedString(u.bBlind) : ''}</Text>
                        <Text style={styles.blinds}>{u.ante ? numberToSuffixedString(u.ante) : ''}</Text>
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
})

const styles = StyleSheet.create({
  cardTitle: {
    fontSize: responsiveFontSize(2.25),
    fontWeight: 'bold',
    color: '#777',
    textAlign: 'center'
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
  blindsHeader: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    flex: 2,
    textDecorationLine: 'underline',
  },
  blinds: {
    fontSize: responsiveFontSize(2),
    textAlign: 'center',
    flex: 2,
  },
})