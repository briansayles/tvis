import { useQuery, useMutation} from '@apollo/client'
import React, {useState} from 'react'
import { ActivityIndicator, Alert, View, ScrollView, StyleSheet, RefreshControl, TouchableHighlight} from 'react-native'
import { Text, Card, Button, Icon, Divider, } from 'react-native-elements';

import { BannerAd } from '../components/Ads'

import { smallestChipArray, sortSegments, sortChips, sortEntryFees, numberToSuffixedString, responsiveFontSize, dictionaryLookup } from '../utilities/functions'
import { currentUserQuery, getTournamentQuery, deleteTournamentMutation, currentUserTournamentsQuery, createChipMutation, createSegmentMutation, createCostMutation} from '../constants/GQL'

export default ( (props) => {
  const [refreshingState, setRefreshingState] = useState(false)
  const {data, loading: loadingData, error: errorData, client, refetch} = useQuery(getTournamentQuery, {variables: {id: props.navigation.getParam('id')}})
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
  const editButtonColor = dictionaryLookup("editButtonColor")

  const _navigateToTimerButtonPressed = (id) => {props.navigation.navigate('Details', {id: id})}
  const _navigateToTimerEditorButtonPressed = (timer) => {props.navigation.navigate('TimerEdit', {timer})}

  const _navigateToTableList = (id) => {
    props.navigation.navigate('TableList', {id: id})
  }

  const _navigateToPlayerList = (id) => {
    props.navigation.navigate('PlayerList', {id: id})
  }

  const _navigateToGeneralInfoEdit = (tourney) => {
    props.navigation.navigate('GeneralInfoEdit', {tourney: tourney})
  }

  const _navigateToBuyList = (id) => {
    props.navigation.navigate('BuyList', {id: id})
  }

  const _navigateToPayoutLevelList = (id) => {
    props.navigation.navigate('PayoutSetup', {id: id})
  }
	const [ deleteTournament ] = useMutation(deleteTournamentMutation, {})
  
  const deleteButtonPressed = (args) => {
		if (args.id==="tbd") {return}
    Alert.alert(
      "Confirm Delete",
      "Delete: \n" + args.title + " ?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
				{ text: "OK", onPress: () => 
				
					deleteTournament(
						{
							variables: {id: args.id},
							optimisticResponse: {
								deleteTournament: {
									__typename: "Tournament",
									id: args.id,
								}
							},
							update: (cache, mutationResponse) => {
								try {
									const { data: { deleteTournament }} = mutationResponse
									let cacheData = cache.readQuery({ 
										query: currentUserTournamentsQuery,
										variables: {},
									})
									cacheData = {
										user: {
											...cacheData.user,
											tournaments: 
												cacheData.user.tournaments.filter(i => (i.id !== deleteTournament.id))
										}
									}
									cache.writeQuery({
										query: currentUserTournamentsQuery,
										variables: {},
										data: cacheData,
                  })
                  props.navigation.goBack()
								} catch (error) {
									console.log('error: ' + error.message)
								}
							}
						}
					)
				}
      ],
      { cancelable: false }
		)
  }
  
  const editChipButtonPressed = (chip) => {props.navigation.navigate('ChipEdit', {chip, 'tID': props.navigation.getParam('id')})}
  const [createChip] = useMutation(createChipMutation, {
    variables:
    {
      "tournamentId": props.navigation.getParam('id'),
    },
    update: (cache, {data: { createChip }}) => {
      try {
        let cacheData = cache.readQuery({ 
          query: getTournamentQuery, 
          variables: {id: props.navigation.getParam('id')}, 
        })
        cacheData = {
          Tournament: {
            ...cacheData.Tournament,
            chips: [...cacheData.Tournament.chips, createChip]
          }
        }
        cache.writeQuery({ 
          query: getTournamentQuery, 
          variables: {id: props.navigation.getParam('id')},
          data: cacheData,
        })
        if (createChip.id !== "tbd") props.navigation.navigate('ChipEdit', {'chip': createChip, 'tID': props.navigation.getParam('id')})
      } catch (error) {
        console.log('error: ' + error.message)
      }
    },
  })
  
  // const addChipButtonPressed = () => {createChip()}

  const [createSegment] = useMutation(createSegmentMutation,
    {
      variables: {"tournamentId": props.navigation.getParam('id'),},
      update: (cache, {data: { createSegment }}) => {
        try {
          let cacheData = cache.readQuery({ 
            query: getTournamentQuery, 
            variables: {id: props.navigation.getParam('id')}, 
          })
          cacheData = {
            Tournament: {
              ...cacheData.Tournament,
              segments: [...cacheData.Tournament.segments, createSegment]
            }
          }
          cache.writeQuery({ 
            query: getTournamentQuery, 
            variables: {id: props.navigation.getParam('id')},
            data: cacheData,
          })
          if (createSegment.id !== "tbd") props.navigation.navigate('SegmentEdit', {'segment': createSegment, 'tID': props.navigation.getParam('id')})
        } catch (error) {
          console.log('error: ' + error.message)
        }
      },
    }
  )
  const editSegmentButtonPressed = (segment) => {
    props.navigation.navigate('SegmentEdit', {segment, 'tID': props.navigation.getParam('id')})
  }

  const [createCost] = useMutation(createCostMutation, 
    {
      variables:{"tournamentId": props.navigation.getParam('id'),},
      update: (cache, {data: { createCost }}) => {
        try {
          let cacheData = cache.readQuery({ 
            query: getTournamentQuery, 
            variables: {id: props.navigation.getParam('id')}, 
          })
          cacheData = {
            Tournament: {
              ...cacheData.Tournament,
              costs: [...cacheData.Tournament.costs, createCost]
            }
          }
          cache.writeQuery({ 
            query: getTournamentQuery, 
            variables: {id: props.navigation.getParam('id')},
            data: cacheData,
          })
          if (createCost.id !== "tbd") props.navigation.navigate('CostEdit', {'cost': createCost, 'tID': props.navigation.getParam('id')})
        } catch (error) {
          console.log('error: ' + error.message)
        }
      },
    }
  )
  const editCostButtonPressed = (cost) => {
    props.navigation.navigate('CostEdit', {cost, 'tID': props.navigation.getParam('id')})
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
							title="General Tournament Info"
						>
              <TouchableHighlight onPress={() => _navigateToGeneralInfoEdit(Tournament)}>
                <View style={{flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={styles.cardTitle}>{Tournament.title ? Tournament.title.toString() + "\n" : ""}</Text>
                  <Text style={styles.title}>{Tournament.subtitle ? Tournament.subtitle.toString() + "\n" : ""}</Text>
                  <Text style={styles.title}>{dictionaryLookup(Tournament.game.toString(), "GameOptions", "long") + "\n"}</Text>
                  <Text style={styles.title}>{Tournament.comments ? Tournament.comments.toString() : ''}</Text>
                </View>
              </TouchableHighlight>
            </Card>

            <Card
            title="Tournament Format"
          >
            <View>
              {
                fees.map((u, i) => {
                  return (
                    <TouchableHighlight key={i} onPress={() => editCostButtonPressed(u)} >
                      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Text style={[styles.title, {flex: 5, textAlign: 'left', }]} >
                          {(dictionaryLookup(u.costType.toString(), "EntryFeeOptions", "long") || "") + ": "}
                        </Text>
                        <Text style={[styles.title, {flex: 3, textAlign: 'right', }]} >
                          {(u.price && u.price.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true,  minimumFractionDigits: 0, maximumFractionDigits: 2}))}
                        </Text>
                        <Text style={[styles.title, {flex: 6, textAlign: 'right', }]}>
                          {u.chipStack ? u.chipStack.toLocaleString(undefined, {style: 'decimal', maximumFractionDigits: 0, useGrouping: true}) + " Chips" : ""}
                        </Text>
                      </View>
                    </TouchableHighlight>
                  )
                })
              }
              {userIsOwner && <TouchableHighlight onPress={() => createCost()}>
                <Icon name="ios-add" color="green" type="ionicon" size={responsiveFontSize(4)} />
              </TouchableHighlight>
              }
              <Divider style={{ backgroundColor: 'grey' }} />
              <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingTop: responsiveFontSize(4)}}>
                <Text style={styles.blindsHeader}>Minutes</Text>
                <Text style={styles.blindsHeader}>Small Blind</Text>
                <Text style={styles.blindsHeader}>Big Blind</Text>
                <Text style={styles.blindsHeader}>Ante</Text>
              </View>
              <View style={{flexDirection: 'column', justifyContent: 'space-around', paddingTop: 3, paddingBottom: 3}}>              
                {
                  segments.map((u, i) => {
                    return (
                      <TouchableHighlight key={i} onPress={() => editSegmentButtonPressed(u)} >
                        <View style={{flexDirection: 'column'}}>
                          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={styles.blinds}>{u.duration ? u.duration.toString() : '---'}</Text>
                            <Text style={styles.blinds}>{u.sBlind ? numberToSuffixedString(u.sBlind) : '---'}</Text>
                            <Text style={styles.blinds}>{u.bBlind ? numberToSuffixedString(u.bBlind) : '---'}</Text>
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
                      </TouchableHighlight>
                    )
                  })
                }
                {userIsOwner && <TouchableHighlight onPress={() => createSegment()}>
                  <Icon name="ios-add" color="green" type="ionicon" size={responsiveFontSize(4)} />
                </TouchableHighlight>
                }
              </View>
            </View>              
          </Card>

          <Card
            title="Chips"
          >
            <View style={{flexDirection: 'column', justifyContent: 'flex-start'}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#eee', paddingTop: 3, paddingBottom: 3}}>
                {chips.map((u,i) => {
                  return (
                    <TouchableHighlight key={i} onPress={() => editChipButtonPressed(u)} >
                      <View style={{flexDirection: 'column', justifyContent:'center', alignItems: 'center'}}>
                        <Icon name='poker-chip' color={u.color} type='material-community' size={responsiveFontSize(4.5)}/>
                        <Text style={styles.chipText}>{numberToSuffixedString(u.denom)}</Text>
                      </View>
                    </TouchableHighlight>
                  )
                })}
              </View>
              {userIsOwner && <TouchableHighlight onPress={() => createChip()}>
                <Icon name="ios-add" color="green" type="ionicon" size={responsiveFontSize(4)} />
                </TouchableHighlight>
              }
            </View>
          </Card>

          <Card
            title="Buy Ins"
          >
            <TouchableHighlight onPress={()=> _navigateToBuyList(Tournament.id)} >
              <View key={i} style={{flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center'}}>
                <Text style={styles.title} containerStyle={{flex: 3}}>
                  {(totalCost).toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true})}
                </Text>
                <Text style={styles.title} containerStyle={{flex: 3}}>
                  {(totalChipStack).toLocaleString(undefined, {style: 'decimal', maximumFractionDigits: 0, useGrouping: true})} Chips
                </Text>
              </View>
            </TouchableHighlight>
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
              <Text style={[styles.cardTitle, {flex: 10}]}>Tournament Timer</Text>
              {userIsOwner && 
                // <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToTimerEditorButtonPressed(Tournament.timer)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
                <Icon containerStyle={{flex: 1}} name='edit' type='font-awesome' onPress={()=> _navigateToTimerEditorButtonPressed(Tournament.timer)} color={editButtonColor} reverse size={responsiveFontSize(1.25)}/>
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
          <View style={{
            marginTop: responsiveFontSize(4),
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center',
          }}>
            <Button
              onPress={()=>deleteButtonPressed(Tournament)}
              icon={
                <Icon
                  name="ios-trash"
                  color="red"
                  type="ionicon"
                  size={responsiveFontSize(6)}
                />
              }
              type="clear"
            />
            <View></View>
        </View>
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
    fontSize: responsiveFontSize(1.75),
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