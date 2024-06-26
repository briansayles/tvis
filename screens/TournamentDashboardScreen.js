import { useMutation, useSubscription, gql } from '@apollo/client'
import React, {useState, useEffect} from 'react'
import { ActivityIndicator, Alert, View, ScrollView, RefreshControl, Pressable, SafeAreaView, SectionList, TouchableOpacity, useWindowDimensions} from 'react-native'
import { Text, Button, Slider, } from '@rneui/themed';
import { styles, responsiveFontSize, } from '../styles'
import { ErrorMessage } from '../components/ErrorMessage'
import { SwipeableCollapsibleSectionList } from '../components/SwipeableList'
import { AppLayout } from '../components/AppLayout'
import { DeleteButton, GoToTimerButton, MyInput} from '../components/FormComponents'
import { smallestChipArray, sortSegments, sortChips, sortEntryFees, dictionaryLookup } from '../utilities/functions'
import { printAsync, printToFileAsync } from 'expo-print';
import { shareAsync } from 'expo-sharing';

export const TournamentDashboardScreen = (props) => {
  const {height, width} = useWindowDimensions()
  const orientation = height > width ? 'portrait' : 'landscape'
  const [sliderValue, setSliderValue] = useState(0)
  const {data, loading, error, client, refetch} = useSubscription(TOURNAMENT_SUBSCRIPTION, {variables: {id: props.route.params.id}})
  const [deleteTournament, {loading: deletingTournament, data: deleteTournamentData, error: deleteTournamentError}] = useMutation(DELETE_TOURNAMENT_MUTATION, {variables: {id: props.route.params.id}})
  const [copyTournament, {loading: copyingTournament, data: copiedTournamentData, error: copyTournamentError}] = useMutation(COPY_TOURNAMENT_MUTATION, {})
  const copyTournamentFunction = async (segments, chips, costs, title, subtitle, timer) => {
    let newSegmentsArray=[], newChipsArray=[], newCostsArray=[], newTimersArray=[]
    segments.map((segment, index) => {
      let {sBlind, bBlind, ante, duration} = segment
      newSegmentsArray.push({sBlind, bBlind, ante, duration})
    })
    chips.map((chip, index) => {
      let {color, denom, qtyAvailable} = chip
      newChipsArray.push({color, denom, qtyAvailable})
    })
    costs.map((cost, index) => {
      let {chipStack, costType, price} = cost
      newCostsArray.push({chipStack, costType, price})
    })
    let {playEndOfRoundSound, playOneMinuteRemainingSound, endOfRoundSpeech, oneMinuteRemainingSpeech} = timer
    newTimersArray.push({playEndOfRoundSound, playOneMinuteRemainingSound, endOfRoundSpeech, oneMinuteRemainingSpeech, active: false })
    const newTourney = await copyTournament({variables: {
      Title: title,
      Subtitle: subtitle,
      Segments: {'data': newSegmentsArray},
      Chips: {'data': newChipsArray},
      Costs: {'data': newCostsArray},
      Timers: {'data': newTimersArray}
    }})
    Alert.alert('Tournament Copied', 'We copied this tournament to a new one for you. Click OK to go to the new tournament to edit or run it.', [{text: 'OK', onPress: ()=>{
      props.navigation.navigate('Tournament Dashboard', {id: newTourney.data.insert_tournaments_one.id})
    }, style: 'default'}])
  }

  const [ createSegment, {loading: creatingSegment, data: createSegmentData, error: createSegmentError} ] = useMutation(CREATE_SEGMENT_MUTATION, {
    onCompleted: ({insert_segments_one}) => {
      editSegmentItem(insert_segments_one)
    },
  })
  const createSegmentItem = () => {createSegment({variables: {tournamentId: data.tournaments_by_pk.id, duration: data.tournaments_by_pk.Segments[0]?.duration || 15}})}
  const [ createChip, {loading: creatingChip, data: createChipData, error: createChipError} ] = useMutation(CREATE_CHIP_MUTATION, {
    onCompleted: ({insert_chips_one}) => {
      editChipItem(insert_chips_one)
    },
  })
  const createChipItem = () => {createChip({variables: {tournamentId: data.tournaments_by_pk.id, color: null}})}
  const [ createCost, {loading: creatingCost, data: createCostData, error: createCostError} ] = useMutation(CREATE_COST_MUTATION, {
    onCompleted: ({insert_costs_one}) => {
      editCostItem(insert_costs_one)
    },
  })
  const createCostItem = () => {createCost({variables: {tournamentId: data.tournaments_by_pk.id}})}
  
  const editSegmentItem = (item) => { props.navigation.navigate('Segment Editor', {id: item.id})}
  const editChipItem = (item) => { props.navigation.navigate('Chip Editor', {id: item.id})}
  const editCostItem = (item) => { props.navigation.navigate('Entry Fee Editor', {id: item.id})}
  const editTournamentInfoItem = (item) => {props.navigation.navigate('Tournament Info Editor', {id: props.route.params.id})}
  const editTimerItem = (item) => { props.navigation.navigate('Timer Editor', {id: item.id})}

  const [updateSegmentsDurations] = useMutation(UPDATE_DURATIONS_MUTATATION)
  const editAllSegmentDurations = (duration) => {
    Alert.alert(
      'Confirm Change', 
      'Are you sure you want to change all blind levels to ' + duration + ' minutes?',
      [
        {text: 'Cancel', onPress: ()=>{}, style: 'cancel'},
        {
          text: 'OK', 
          onPress: async ()=> {
            await updateSegmentsDurations(
              {
                variables: {
                  tournamentId: props.route.params.id,
                  duration: duration,
                }
              }
            )
            Alert.alert('Done', 'All blind levels have been changed to ' + duration + ' minutes.', [{text: 'Roger that. Thanks!', onPress: ()=>{}, style: 'default'}])
          }, 
          style: 'default'
        }
      ]
    )
  }
  const [updateSegmentsAntes] = useMutation(UPDATE_ANTES_MUTATION)
  const removeAllAntes = () => {
    Alert.alert(
      'Confirm Change', 
      'Are you sure you want to remove ALL antes?',
      [
        {text: 'Cancel', onPress: ()=>{}, style: 'cancel'},
        {
          text: 'OK', 
          onPress: async ()=> {
            await updateSegmentsAntes(
              {
                variables: {
                  tournamentId: props.route.params.id,
                }
              }
            )
            Alert.alert('Done', 'All antes have been removed.', [{text: 'Roger that. Thanks!', onPress: ()=>{}, style: 'default'}])
          }, 
          style: 'default'
        }
      ]
    )

  }

  useEffect(()=>{
    if (data) {
      setSliderValue(data.tournaments_by_pk?.Segments[0]?.duration || 0)
    }
  },[data])
  
  const createError = createSegmentError || createChipError || createCostError

  if (loading || deletingTournament || deleteTournamentData) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (createError) return (<ErrorMessage error={createError}/>)
  if (data) {
    const Tournament = data.tournaments_by_pk
    const segments = sortSegments(Tournament.Segments)
    const chips = sortChips(Tournament.Chips)
    const costs = sortEntryFees(Tournament.Costs)
    const timer = Tournament.Timers[0]
    const smallestChipReq = smallestChipArray(chips, segments)
    let augmentedSegments = segments.map((segment, index) => {
      return {...segment, segmentIndex: index}
    })
    let splicedCount = 0
    smallestChipReq.map((chip, index) => {
      if(chip.segment <= segments.length - 2) {
        augmentedSegments.splice(chip.segment + 1 + splicedCount, 0, {
          denom: chip.denom,
          color: chip.color,
          type: 'colorup'
        })
        splicedCount += 1
      }
    })
    const totalScheduledDuration = Tournament.Segments_aggregate.aggregate.sum.duration || 0
    const sectionListData = [
      { 
        key: 0,
        sectionIndex: 0,
        title: "Tournament Info",
        titleStyles: [],
        data: [Tournament],
        initiallyCollapsed: false,
        includeCountInTitle: false,
        createFunction: null,
        onPressFunction: ()=>{},
        rightButtons: [],
        renderFrontRow: (item, index, collapsed) => {
          return (
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {editTournamentInfoItem(item)}}>
              <Text style={[styles.bold, {}]}>{item.title}</Text>
              <Text style={[, {}]}>{item.subtitle}</Text>
            </Pressable>
          )
        }
      },
      {
        key: 1,
        sectionIndex: 1,
        title: "Entry Fees",
        titleStyles: [],
        data: costs,
        initiallyCollapsed: false,
        includeCountInTitle: true,
        createFunction: createCostItem,
        onPressFunction: editCostItem,
        rightButtons: [],
        renderFrontRow: (item, index, collapsed) => {
          return(
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {editCostItem(item)}}>
              <Text style={[ , {flex: 4, }]}>{(item.price || 0).toLocaleString(undefined, {style: 'currency', currency: 'usd'})} {dictionaryLookup(item.costType, "EntryFeeOptions", "long")}</Text>
              <Text style={[ , {flex: 2 ,textAlign: 'right', }]}>{(item.chipStack || 0).toLocaleString()} chips</Text>
             </Pressable>
          )
        }
      },
      { 
        key: 2,
        sectionIndex: 2,
        title: "Blinds Levels (" + segments.length + ')',
        titleStyles: [],
        data:   [...augmentedSegments, {id: 'totals'}],
        initiallyCollapsed: false,
        includeCountInTitle: false,
        createFunction: createSegmentItem,
        onPressFunction: editSegmentItem,
        rightButtons: [],
        renderFrontRow: (item, index, collapsed) => {
          return(
            <>
            {item.duration && <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {editSegmentItem(item)}}>
              <Text style={[ styles.bold, {flex: 0.5, textAlign: 'left'}]}>{item.segmentIndex + 1}:</Text>
              <Text style={[ styles.bold, {flex: 4, }]}>{item.sBlind.toLocaleString()} / {item.bBlind.toLocaleString()} {item.ante > 0 ? ' + ' + item.ante.toLocaleString() + ' ante': ''}</Text>
              <Text style={[ , {flex: 2 ,textAlign: 'right', }]}>{item.duration.toLocaleString()} Minutes</Text>
            </Pressable>}
            {item.type=='colorup' && <View style={[styles.rowFront, styles.rowFrontColorup, collapsed ? styles.collapsed : null, {} ]} >
              <Text style={[ styles.bold, {flex: 1, textAlign: 'center', color: item.color}]}>Color-Up {item.denom.toLocaleString()  }'s</Text>
            </View>}
            {item.id == 'totals' && <View style={[styles.rowFront, collapsed ? styles.collapsed : null, {borderTopColor: 'black', borderTopWidth: 1} ]} >
              <Text style={[ styles.bold, {flex: 4.5, textAlign: 'left'}]}>Total scheduled duration:</Text>
              <Text style={[ , {flex: 2 ,textAlign: 'right', }]}>{totalScheduledDuration} Minutes</Text>
            </View>}
            </>)
        }
      },
      {
        key: 3,
        sectionIndex: 3,
        title: "Chip Colors & Denominations",
        titleStyles: [],
        data: chips,
        initiallyCollapsed: false,
        includeCountInTitle: true,
        createFunction: createChipItem,
        onPressFunction: editChipItem,
        rightButtons: [],
        renderFrontRow: (item, index, collapsed) => {
          return(
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {} ]} onPress={() => {editChipItem(item)}}>
              <Text style={[ styles.bold, {flex: 2, color: item.color, textAlign: 'right'}]}>{item.denom}</Text>
              <Text style={[ , {flex: 12 ,textAlign: 'right', }]}>{smallestChipReq[index].segment <= (segments.length-2) ? 'Color-up after level ' + (smallestChipReq[index].segment + 1) : ""}</Text>
            </Pressable>
          )
        }
      },
      {
        key: 4,
        sectionIndex: 4,
        title: "Timer Customization",
        titleStyles: [],
        data: [timer],
        initiallyCollapsed: false,
        includeCountInTitle: false,
        createFunction: null,
        onPressFunction: ()=>{},
        rightButtons: [], 
        renderFrontRow: (item, index, collapsed) => {
          return(
            <Pressable style={[styles.rowFront, collapsed ? styles.collapsed : null, {height: collapsed ? 0 : responsiveFontSize(6.75), flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', textAlign: 'left'} ]} onPress={() => editTimerItem(item)}>
              <Text style={[styles.bold, collapsed ? styles.collapsed : null, {}]}>Tap here to customize the timer sounds...</Text>
            </Pressable>
          )
        }
      },

      {
        key: 5,
        sectionIndex: 5,
        title: "Quick Adjustments",
        titleStyles: [],
        data: [ 1, ],
        initiallyCollapsed: false,
        includeCountInTitle: false,
        createFunction: null,
        rightButtons: [],
        renderFrontRow: (item, index, collapsed) => {
          return (
            <>
            <View style={[ collapsed ? styles.collapsed : null, {flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start'}]}>
              <View style={[styles.rowFront, collapsed ? styles.collapsed : null, {flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}]}>
                <Button style={[ , {flex: 2, marginVertical: responsiveFontSize(0.5), }]} titleStyle={[ , {fontSize: responsiveFontSize(1.5)}]} onPress={()=> editAllSegmentDurations(sliderValue)}>Set all durations to: </Button>
                <MyInput
                  value={sliderValue.toString()}
                  placeholder="minutes"
                  onChangeText={(text) => setSliderValue(text)}
                  keyboardType="numeric"
                  containerStyle={{flex: 0.5, alignSelf: 'flex-start'}}
                />
                <Text style={[, {flex: 2, fontSize: responsiveFontSize(1.5)}]}> Minute(s)</Text>
              </View>
              <View style={[styles.rowFront, collapsed ? styles.collapsed : null, {flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}]}>
                <Button style={[, {marginVertical: responsiveFontSize(0.5)}]} titleStyle={[ , {fontSize: responsiveFontSize(1.5)}]} onPress={()=> removeAllAntes()}>Remove antes</Button>
              </View>
              <View style={[styles.rowFront, collapsed ? styles.collapsed : null, {flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}]}>
                <Button style={[, {marginVertical: responsiveFontSize(0.5)}]} titleStyle={[ , {fontSize: responsiveFontSize(1.5)}]} onPress={()=> copyTournamentFunction(segments, chips, costs, Tournament.title, Tournament.subtitle, timer)}>Copy to New Tournament</Button>
              </View>
            </View>
            </>
          )
        }
      },

    ]

    const html = `
      <html><body>
        <h1>Tournament Title</h1>
        <p>Tournament Subtitle will probably go here</p>
        <h2>Buy-In Information</h2>
        <p>This is where buy-in data will go.</p>
        <h2>Blinds Schedule</h2>
        <p>This is where the blinds schedule will go</p>
      </body></html>
    `

    const generatePDF = async () => {
      const file = await printToFileAsync( {
        html,
        base64: false,
      })

      await shareAsync(file.uri)
    }

    return (
      <AppLayout>
        <View style={{flex: 9, flexDirection: 'column'}}>
          <SwipeableCollapsibleSectionList
            sections={sectionListData}
          />
        </View>
        <View style={{flex: orientation == 'portrait' ? 1 : 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
          <DeleteButton
            mutation={deleteTournament}
            navigation={()=> props.navigation.popToTop()}
            confirmationString={'Are you sure you want to delete this tournament? This can\'t be undone!!'}
            confirmationTitleString='Confirm Deletion'
          />
          <GoToTimerButton
            navigation={()=> props.navigation.navigate('Timer', {id: Tournament.id, timerId: Tournament.Timers[0].id })}
          />
          <Button title="Print to PDF" onPress={generatePDF}> 

          </Button>
        </View>
      </AppLayout>
    )
  }
}

const UPDATE_TOURNAMENT_MUTATION = gql`
  mutation UpdateTournament($id: uuid!, $subtitle: String = "", $title: String = "") {
    update_tournaments_by_pk(pk_columns: {id: $id}, _set: {title: $title, subtitle: $subtitle}) {
      id
      subtitle
      title
    }
  }
`
const TOURNAMENT_SUBSCRIPTION = gql`
  subscription TournamentSubscription($id: uuid!) {
    tournaments_by_pk(id: $id) {
      id
      title
      subtitle
      Segments {
        duration
        sBlind
        bBlind
        ante
        id
      }
      Timers(limit: 1) {
        active
        clock_updated_at
        playOneMinuteRemainingSound
        oneMinuteRemainingSpeech
        playEndOfRoundSound
        endOfRoundSpeech
        backgroundColor
        id
      }
      Segments_aggregate {
        aggregate {
          sum {
            duration
          }
        }
      }
      Chips {
        color
        denom
        qtyAvailable
        id
      }
      Costs {
        chipStack
        costType
        price
        id
      }
    }
  }
`
const COPY_TOURNAMENT_MUTATION = gql`
  mutation CreateCopyOfTournament($Segments: segments_arr_rel_insert_input, $Chips: chips_arr_rel_insert_input, $Costs: costs_arr_rel_insert_input, $Title: String, $Subtitle: String, $Timers: timers_arr_rel_insert_input) {
    insert_tournaments_one(object: {
      title: $Title, 
      subtitle: $Subtitle, 
      Segments: $Segments, 
      Chips: $Chips,
      Costs: $Costs,
      Timers: $Timers,
    })
    { 
      id
    }
  }
`
const DELETE_TOURNAMENT_MUTATION = gql`
  mutation DeleteTournament($id: uuid!) {
    delete_tournaments_by_pk(id: $id) {
      id
    }
  }
`
const DELETE_SEGMENT_MUTATION = gql`
  mutation DeleteSegment($id: uuid!) {
    delete_segments_by_pk(id: $id) {
      id
    }
  }
`
const DELETE_CHIP_MUTATION = gql`
  mutation DeleteChip($id: uuid!) {
    delete_chips_by_pk(id: $id) {
      id
    }
  }
`
const DELETE_COST_MUTATION = gql`
  mutation DeleteCost($id: uuid!) {
    delete_costs_by_pk(id: $id) {
      id
    }
  }
`
const CREATE_SEGMENT_MUTATION = gql`
  mutation CreateSegment($tournamentId: uuid!, $sBlind: numeric = 0, $duration: numeric = 10, $bBlind: numeric = 0, $ante: numeric = 0, ) {
    insert_segments_one(object: {tournamentId: $tournamentId, ante: $ante, bBlind: $bBlind, duration: $duration, sBlind: $sBlind}) {
      id
    }
  }
`
const CREATE_CHIP_MUTATION = gql`
  mutation CreateChip($tournamentId: uuid!, $color: String=null, $denom: numeric = 0, $qtyAvailable: Int = 0, ) {
    insert_chips_one(object: {tournamentId: $tournamentId, denom: $denom, qtyAvailable: $qtyAvailable, color: $color}) {
      id
    }
  }
`
const CREATE_COST_MUTATION = gql`
  mutation CreateCost($tournamentId: uuid!, $price: numeric = 0, $chipStack: Int = 0, $costType: cost_types_enum=Buyin, ) {
    insert_costs_one(object: {tournamentId: $tournamentId, price: $price, chipStack: $chipStack, costType: $costType, }) {
      id
    }
  }
`
const UPDATE_DURATIONS_MUTATATION = gql`
  mutation UpdateSegmentsDuration($duration: numeric, $tournamentId: uuid = null) {
    update_segments_many(updates: {where: {tournamentId: {_eq: $tournamentId}}, _set: {duration: $duration}}) {
      affected_rows
      returning {
        duration
        id
      }
    }
  }
`
const UPDATE_ANTES_MUTATION = gql`
  mutation UpdateSegmentsAntes($tournamentId: uuid = null) {
    update_segments_many(updates: {where: {tournamentId: {_eq: $tournamentId}}, _set: {ante: 0}}) {
      affected_rows
      returning {
        id
      }
    }
  }
`