import { gql, useMutation, useSubscription} from '@apollo/client'
import React, { useState, useEffect, useReducer, useRef } from 'react'
import { Animated, ActivityIndicator, View, Pressable, SafeAreaView, Platform, useWindowDimensions } from 'react-native'
import { Button, Icon, Text } from '@rneui/themed'
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { useKeepAwake} from 'expo-keep-awake';
import CircularProgress from 'react-native-circular-progress-indicator'
import { ErrorMessage } from '../components/ErrorMessage'
import { smallestChipArray, msToTime, numberToSuffixedString, sortChips, sortSegments, responsiveFontSize, } from '../utilities/functions'
import { AppLayout } from '../components/AppLayout'
import { styles, } from '../styles'
import * as Haptics from 'expo-haptics'
import Constants from 'expo-constants'
const AppOptions = Constants.expoConfig.extra.AppOptions

const initialState = {
  newCSI: 0,
  remainingTimeMS: 0,
  lastSI: 0,
  currentBlindsText: "---/--- + ---",
  nextBlindsText: "---/--- + ---",
  currentDurationText: "-- Minutes",
  nextDurationText: "-- Minutes",
  isActive: false,
  countdownText: "00:00",
  noticeStatus: false,
  currentSegmentFinishTime: null,
  currentSegmentNoticeTime: null,
  currentTime: new Date(),
  title: "",
  subtitle: "",
  currentSegmentCumulativeDuration: 0,
  displayChipArray: [],
}

const stateCalculator = (payload) => {
  const { Timers, Chips, Segments, title, subtitle } = payload
  let sortedSegmentsArray = sortSegments(Segments)
  let sortedChipsArray = sortChips(Chips)
  let smallestChipReq = smallestChipArray(sortedChipsArray, sortedSegmentsArray)
  var cumulativeDuration = 0
  var finishTime = new Date(0)
  var warningTime = new Date(0)
  var previousFinishTime = new Date(0)
  var nowValue = new Date().valueOf()
  var calculatedSegmentIndex = null
  var noticeStatus = false
  for (let i = 0, len = sortedSegmentsArray.length; i < len; i++) {
    if (Timers[0].active) {
      finishTime = new Date(sortedSegmentsArray[i].duration * 60000 + cumulativeDuration - Timers[0].elapsed + new Date(Timers[0].clock_updated_at).valueOf())
    } else {
      finishTime = new Date(sortedSegmentsArray[i].duration * 60000 + cumulativeDuration - Timers[0].elapsed + nowValue)
    }
    warningTime = new Date(finishTime - AppOptions.warningTime)
    sortedSegmentsArray[i].warningTime = warningTime
    sortedSegmentsArray[i].finishTime = finishTime
    if (finishTime.valueOf() >= nowValue && previousFinishTime.valueOf() < nowValue) {
      calculatedSegmentIndex = i
      noticeStatus = nowValue >= warningTime.valueOf() 
    }
    cumulativeDuration += sortedSegmentsArray[i].duration * 60000
    sortedSegmentsArray[i].cumulativeDuration = cumulativeDuration
    previousFinishTime = finishTime
  }
  if (calculatedSegmentIndex === null) calculatedSegmentIndex = sortedSegmentsArray.length - 1 
  let displayedChipCount = 0
  let displayChipArray = []
  for (let ii = 0, len = smallestChipReq.length; ii<len; ii++) {
    if (displayedChipCount < 5 && calculatedSegmentIndex <= smallestChipReq[ii].segment || smallestChipReq[ii].segment < 0)
    {
      displayedChipCount += 1
      displayChipArray.push(smallestChipReq[ii])
    }
  }
  return {
    title,
    subtitle,
    smallestChipReq,
    sortedSegmentsArray,
    sortedChipsArray,
    isActive: Timers[0].active,
    newCSI: calculatedSegmentIndex,
    lastSI: sortedSegmentsArray.length - 1,
    currentBlindsText: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? (
      numberToSuffixedString(sortedSegmentsArray[calculatedSegmentIndex].sBlind) + 
      "/" + numberToSuffixedString(sortedSegmentsArray[calculatedSegmentIndex].bBlind) +
      (sortedSegmentsArray[calculatedSegmentIndex].ante > 0 ? " + " + numberToSuffixedString(sortedSegmentsArray[calculatedSegmentIndex].ante) : ""))
      :"----/---- + ----",
    currentDurationMS: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? (
      sortedSegmentsArray[calculatedSegmentIndex].duration * 60000)
      : 0,
    currentDurationText: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? (
      sortedSegmentsArray[calculatedSegmentIndex].duration.toString() + 
      (sortedSegmentsArray[calculatedSegmentIndex].duration > 1 ? " Minutes" : " Minute"))
      : "--- Minutes",
    nextBlindsText: (calculatedSegmentIndex != null && calculatedSegmentIndex + 1 <= sortedSegmentsArray.length - 1) ? (
      numberToSuffixedString(sortedSegmentsArray[calculatedSegmentIndex +1 ].sBlind) + 
      "/" + numberToSuffixedString(sortedSegmentsArray[calculatedSegmentIndex + 1].bBlind) +
      (sortedSegmentsArray[calculatedSegmentIndex + 1].ante > 0 ? " + " + numberToSuffixedString(sortedSegmentsArray[calculatedSegmentIndex + 1].ante) : ""))
      :"None",
    nextDurationText: (calculatedSegmentIndex != null && calculatedSegmentIndex + 1 <= sortedSegmentsArray.length - 1) ? (
      sortedSegmentsArray[calculatedSegmentIndex + 1].duration.toString() + 
      (sortedSegmentsArray[calculatedSegmentIndex + 1].duration > 1 ? " Minutes" : " Minute"))
      :"",
    currentSegmentFinishTime: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? sortedSegmentsArray[calculatedSegmentIndex].finishTime : null,
    currentSegmentNoticeTime: (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? sortedSegmentsArray[calculatedSegmentIndex].finishTime - AppOptions.warningTime : null,
    currentSegmentCumulativeDuration:  (calculatedSegmentIndex <= sortedSegmentsArray.length - 1) ? sortedSegmentsArray[calculatedSegmentIndex].cumulativeDuration : 0,
    timer: Timers[0],
    noticeStatus,
    displayChipArray,     
  }
}

const remainingTimeCalculator = (isActive, currentSegmentFinishTime, currentSegmentCumulativeDuration, elapsedFromDB) => {
  return isActive ? result = Math.max(new Date(currentSegmentFinishTime).valueOf() - new Date().valueOf() + 400, 0) : result =  Math.max(currentSegmentCumulativeDuration - elapsedFromDB + 400, 0)
}

const reducer =(state, action) => {
  switch (action.type) {
    case 'SETUP': {
      const { isActive, title, smallestChipReq, timer, subtitle, sortedSegmentsArray, sortedChipsArray, newCSI, lastSI, currentBlindsText, currentDurationMS, currentDurationText, nextBlindsText, nextDurationText, currentSegmentFinishTime, currentSegmentNoticeTime, noticeStatus, currentSegmentCumulativeDuration, displayChipArray, } = stateCalculator(action.payload)
      const remainingTimeMS = remainingTimeCalculator(isActive, currentSegmentFinishTime, currentSegmentCumulativeDuration, timer.elapsed)
      return {
        ...state,
        remainingTimeMS,
        title,
        smallestChipReq,
        timer,
        subtitle,
        isActive,
        newCSI,
        lastSI,
        currentBlindsText,
        currentDurationMS, 
        currentDurationText,
        nextBlindsText,
        nextDurationText,
        currentSegmentFinishTime,
        currentSegmentNoticeTime,
        noticeStatus,
        currentTime: new Date(),
        countdownText: msToTime(remainingTimeMS),
        sortedSegmentsArray,
        sortedChipsArray,
        displayChipArray,
     }
    } 
    case 'END_OF_ROUND': {
      const { isActive, title, smallestChipReq, timer, subtitle, sortedSegmentsArray, sortedChipsArray, newCSI, lastSI, currentBlindsText, currentDurationMS, currentDurationText, nextBlindsText, nextDurationText, currentSegmentFinishTime, currentSegmentNoticeTime, noticeStatus, currentSegmentCumulativeDuration, displayChipArray, } = stateCalculator(action.payload)
      const remainingTimeMS = remainingTimeCalculator(isActive, currentSegmentFinishTime, currentSegmentCumulativeDuration, timer.elapsed)
      return {
        ...state,
        remainingTimeMS,
        title,
        smallestChipReq,
        subtitle,
        timer,
        isActive,
        newCSI,
        lastSI,
        currentBlindsText,
        currentDurationMS, 
        currentDurationText,
        nextBlindsText,
        nextDurationText,
        currentSegmentFinishTime,
        currentSegmentNoticeTime,
        noticeStatus,
        currentTime: new Date(),
        sortedSegmentsArray,
        sortedChipsArray,
        displayChipArray,
        }
    }
    case 'ONE_MINUTE_REMAINING': {
      return {
        ...state,
        noticeStatus: true,
        currentTime: new Date(),
      }
    }
    case 'TICK': {
      const remainingTimeMS = remainingTimeCalculator(state.isActive, state.currentSegmentFinishTime, state.currentSegmentCumulativeDuration, state.timer.elapsed)
      return {
        ...state,
        currentTime: new Date(),
        remainingTimeMS,
      }
    }
    default: {
      return {
        ...state,
      }
    }
  }
}

export const TournamentTimerScreen = (props) => {
  const [ playingSound, setPlayingSound] = useState(false)
  const [ toggleTournamentTimer ] = useMutation(UPDATE_TIMER_MUTATION, {})
  const [ jumpTournamentSegment ] = useMutation(JUMP_SEGMENT_MUTATION, {})
  const [ resetTournamentTimer ] = useMutation(RESET_TIMER_MUTATION, {})
  const { height, width } = useWindowDimensions()
  const { data, loading, error, } = useSubscription(TOURNAMENT_SUBSCRIPTION, { variables: { id: props.route.params.id}, onData: ({data: {data}}) => {}})
  const [state, dispatch] = useReducer(reducer, initialState)
  const { newCSI, remainingTimeMS, lastSI, currentBlindsText, nextBlindsText, currentDurationMS, currentDurationText, nextDurationText, isActive, smallestChipReq, title,
          currentSegmentFinishTime, currentSegmentNoticeTime, noticeStatus, sortedSegmentsArray, sortedChipsArray, timer, subtitle, displayChipArray, } = state
        
  useEffect(() => {
    if (!data) { return; }
    let { tournaments_by_pk } = data;
    dispatch({ type: 'SETUP', payload: tournaments_by_pk });
  }, [data, height, width])

  useEffect(()=> {
    let EORTimeout
    let speech = ""
    if (!currentSegmentFinishTime || !isActive) return
    EORTimeout = setTimeout(()=> {
      if (!playingSound) {
        if (newCSI == lastSI) {
          if (timer.playEndOfRoundSound) playSoundEffect("The tournament has reached the end of the final round.  The timer has been stopped.", 1.5, true, 0.5)
          toggleTimerButtonPressed()
        } else {
          speech = (timer.endOfRoundSpeech ? timer.endOfRoundSpeech + ". ":"") + "The blinds are now " + nextBlindsText.replace(/k/g, " thousand ").replace("/", " and ").replace("false","").replace("+ ", "with an ante of ")
          dispatch({type: 'END_OF_ROUND', payload: data.tournaments_by_pk})
          if (timer.playEndOfRoundSound) playSoundEffect(speech, 1, true, 1)
        }
      }
    }, new Date(currentSegmentFinishTime).valueOf() - new Date().valueOf())
    return () => {
      clearTimeout(EORTimeout)
    }
  }, [currentSegmentFinishTime, isActive, timer])

  useEffect(()=> {
    let lastMinuteTimeOut
    if (!currentSegmentNoticeTime || !isActive || currentSegmentNoticeTime.valueOf() <= new Date().valueOf()) return
    lastMinuteTimeOut = setTimeout(()=> {
      dispatch({type: 'ONE_MINUTE_REMAINING'})
      if (!playingSound && timer.playOneMinuteRemainingSound) playSoundEffect((timer.oneMinuteRemainingSpeech || ""), 1.5, true, 0.5)
    }, new Date(currentSegmentNoticeTime).valueOf() - new Date().valueOf())
    return () => {
      clearTimeout(lastMinuteTimeOut)
    }
  }, [currentSegmentNoticeTime, isActive, timer])

  useEffect(() => {
    let ticker
    if (isActive) {
      ticker = setInterval(()=> {
        dispatch({type: 'TICK'})
      }, AppOptions.timerUpdateInterval)
    }
    return ()=> {
      clearInterval(ticker)
    }
  }, [isActive])

  const playSoundEffect = async (customSpeech="", beepRate, playBeeps, volume) => {
    try {
      const { sound: soundObject, status }  = await Audio.Sound.createAsync(
        require('../assets/sounds/0925.mp3'),
        {
          positionMillis: 0,
          volume,
          rate: beepRate,
          shouldPlay: playBeeps,
          shouldCorrectPitch: false,
        },
        (playbackStatus) => {
          if (playbackStatus.didJustFinish) {
            Speech.speak(
              customSpeech,
              {
                rate: 0.9,
                pitch: Platform.OS === "ios" ? 1.30 : 1.00,
                onDone: async () => {
                  setPlayingSound(false)               
                }
              }
            )
          }
        }
      )
    } catch (error) {
      setPlayingSound(false)
    }
  }

  const chipFadeAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([    
          Animated.timing(
            chipFadeAnimation,
            {
              toValue: 0.1,
              duration: 5000,
              useNativeDriver: true,
              isInteraction: false,
            }
          ),
          Animated.timing(
            chipFadeAnimation,
              {
                toValue: 1,
                duration: 5000, 
                useNativeDriver: true,
                isInteraction: false,
              }
          ),
        ])
      ).start()
    }
    animate()
  },[data])
  
  toggleTimerButtonPressed = async ()=> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    toggleTournamentTimer({
      variables: {
        id: timer.id,
        active: !(timer.active),
        elapsed: timer.elapsed + (timer.active ? new Date().valueOf() - new Date(timer.clock_updated_at).valueOf() : 0),
      },
      optimisticResponse: {
        update_timers_by_pk: {
          id: timer.id,
          elapsed: timer.elapsed + (timer.active ? new Date().valueOf() - new Date(timer.clock_updated_at).valueOf() : 0),
          active: !(timer.active),
          clock_updated_at: new Date(),
        }
      }
    })
  }

  fwdButtonPressed = async () => {
    if (newCSI < lastSI) {
      jumpTournamentSegment({
        variables: {
          id: timer.id,
          elapsed: sortedSegmentsArray[newCSI].cumulativeDuration +1,
        },
        optimisticResponse: {
          update_timers_by_pk: {
            id: timer.id,
            elapsed: sortedSegmentsArray[newCSI].cumulativeDuration +1,
            active: timer.active,
            clock_updated_at: new Date(),
          }
        },
      })
      } else {
    }
  }

  rwdButtonPressed = async () => {
    var elapsed = 0
    if (newCSI > 0) {
      if (remainingTimeMS >= sortedSegmentsArray[newCSI].duration*60000 - 10000) { 
        if (newCSI >= 2) {
          elapsed = sortedSegmentsArray[newCSI-2].cumulativeDuration + 1
        } else {
          elapsed = 0
        } 
      } else {
        elapsed = sortedSegmentsArray[newCSI-1].cumulativeDuration + 1
      }
    }
    jumpTournamentSegment({
      variables: {
        id: timer.id,
        elapsed,
      },
      optimisticResponse: {
        update_timers_by_pk: {
          id: timer.id,
          elapsed,
          active: timer.active,
          clock_updated_at: new Date(),
        }
      },
    })
  }

  resetTimerButtonPressed = async () => {
    resetTournamentTimer({
      variables: {
        id: timer.id,
      },
      optimisticResponse: {
        update_timers_by_pk: {
          id: timer.id,
          elapsed: 0,
          active: false,
          clock_updated_at: new Date(),
        }
      },
    })
  }

  useKeepAwake('timer')

  if (loading) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (data) {  
    const orientation = height > width ? 'portrait' : 'landscape'
    return (
      <>
        {orientation == 'landscape' &&
          <SafeAreaView style={[, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', alignSelf: 'center', flex: 1, width: width*0.98, }]}>
            <LinearGradient
              colors={[ '#257a2f', '#194a2f', '#226a2f' ]}
              style={[, {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'stretch', flex: 1, borderRadius: width *0.08}]}
            >
            <View style={[, {flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', flex: 4}]}>
              {displayChipArray.map((u,i) => {
                  return (
                    <Animated.View key={i} style={[, {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flex: 1/displayChipArray.length, opacity: (newCSI + 1 <= u.segment) ? 1 : (chipFadeAnimation) }]}>
                      <Text style={[, styles.chipText, {flex: 5, textAlign: 'right'}]} >{numberToSuffixedString(u.denom)}  </Text>
                      <Icon containerStyle={[ , {flex: 5, }]} name='poker-chip' color={u.color} type='material-community' size={responsiveFontSize(7)}/>
                    </Animated.View>
                  )
              })}
            </View>
            <View style={[, {flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'stretch', flex: 7}]}>
              <View style={[ , {flex: 0.5}]}></View>
              <Text style={[, styles.titleText, { textAlign:  'center', flex: 1.5,}]}>{title}</Text>            
              <Text style={[, styles.titleText, { textAlign:  'center', flex: 1.5,}]}>{subtitle}</Text>            
              <View style={[ , {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 12}]}>
                <Pressable onPress={()=> toggleTimerButtonPressed()} onLongPress={()=> resetTimerButtonPressed()}>
                  <CircularProgress
                    value={remainingTimeMS}
                    radius={height*0.24}
                    duration={500}
                    progressValueColor={noticeStatus ? 'red' : '#ecf0f1'}
                    activeStrokeColor={noticeStatus ? 'red' : (isActive ? 'limegreen' : 'orange')}
                    initialValue={currentDurationMS}
                    maxValue={currentDurationMS}
                    progressFormatter={(remainingTimeMS) => {
                      'worklet'
                      return msToTime(remainingTimeMS)
                    }}
                  />
                  </Pressable>
              </View>
              <View style={[, {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', alignSelf: 'stretch' , flex: 2.5, }]}>
                {<Button containerStyle={[, {flex: 1}]} title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='restore' size={responsiveFontSize(3)}/>} onPress={()=> resetTimerButtonPressed()}></Button>}
                {<Button containerStyle={[, {flex: 1}]} title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='fast-rewind' size={responsiveFontSize(3)}/>} onPress={()=> rwdButtonPressed()}></Button>}
                {<Button containerStyle={[, {flex: 1}]} title="" buttonStyle={{backgroundColor: 'transparent'}} icon={ isActive ? <Icon name='pause' size={responsiveFontSize(3)}/> : <Icon name='play-arrow' size={responsiveFontSize(3)}/>} onPress={()=> toggleTimerButtonPressed()}></Button>}
                {<Button containerStyle={[, {flex: 1}]} title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={()=> fwdButtonPressed()}></Button>}
              </View>
            </View>
            <View style={[, {flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', flex: 9}]}>
              <View style={[, {flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', flex: 1}]}></View>
              <View style={[, {flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', flex: 7}]}>
                <Text style={[, styles.blindsTitleTextLandscape, styles.underlinedText, noticeStatus && styles.blindsNoticeText, { }]}>
                  Current Blinds:
                </Text>
                <Text style={[, styles.blindsTextLandscape, noticeStatus && styles.blindsNoticeText, {}]}>
                  {currentBlindsText}
                </Text>
                <Text style={[, styles.durationTextLandscape, noticeStatus && styles.blindsNoticeText, {}]}>
                  {currentDurationText}
                </Text>
              </View>
              <View style={[, {flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', alignSelf: 'stretch' , flex: 2, }]}>
              </View>
              <View style={[, {flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', flex: 5}]}>
                <Text style={[, styles.nextBlindsTextLandscape, styles.underlinedText, noticeStatus && styles.nextBlindsNoticeText]}>
                  Next Blinds:
                </Text>
                <Text style={[, styles.nextBlindsTextLandscape, noticeStatus && styles.nextBlindsNoticeText]}>
                  {nextBlindsText}
                </Text>
                <Text style={[, styles.nextBlindsTextLandscape, noticeStatus && styles.nextBlindsNoticeText]}>
                  {nextDurationText}
                </Text>
              </View>
              <View style={[, {flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', flex: 1}]}></View>
            </View>

            </LinearGradient>

          </SafeAreaView>
        }
        {orientation == 'portrait' && 
          <AppLayout>
            <View style={[{flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', alignSelf: 'center'}]}>
              <LinearGradient
                  colors={[ '#257a2f', '#194a2f', '#226a2f' ]}
                  style={{ flex: 1, width: width*0.98, height: height * .98, alignItems: 'stretch', borderRadius: width*0.05 }}
              >
                <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
                  <Text style={[styles.titleText, { textAlign: 'center'}]}>{title}</Text>
                  <Text style={[styles.titleText, { textAlign: 'center'}]}> {subtitle} </Text>
                </View>
                  <View style={{flex: 8, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',}}>
                    <View style={{flex: 6, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', }}>
                      <Text
                        style={[styles.blindsText, noticeStatus && styles.blindsNoticeText]}
                      >
                        {currentBlindsText}
                      </Text>
                      <Text
                        style={[styles.durationText, noticeStatus && styles.blindsNoticeText]}
                      >
                        {currentDurationText}
                      </Text>
                    </View>
                    <View style={{flex: 10, flexDirection: 'column',  justifyContent: 'space-evenly', alignItems: 'center', }}>
                      <Pressable onPressIn={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} onPress={()=> toggleTimerButtonPressed()} onLongPress={()=> resetTimerButtonPressed()}>
                        <CircularProgress
                          value={remainingTimeMS}
                          radius={width * 0.20}
                          duration={500}
                          progressValueColor={noticeStatus ? 'red' : '#ecf0f1'}
                          activeStrokeColor={noticeStatus ? 'red' : (isActive ? 'limegreen' : 'orange')}
                          initialValue={currentDurationMS}
                          maxValue={currentDurationMS}
                          progressFormatter={(remainingTimeMS) => {
                            'worklet'
                            return msToTime(remainingTimeMS)
                          }}
                        />
                      </Pressable>
                    </View>
                    <View style={{flex: 4, flexDirection: orientation == 'portrait' ? 'column' : 'row',  justifyContent: 'space-evenly', alignItems: 'center', }}>
                      <Text
                        style={[styles.nextBlindsText, noticeStatus && styles.nextBlindsNoticeText]}
                      >
                        {'Next Blinds: ' + nextBlindsText}
                      </Text>
                      <Text
                        style={[styles.nextBlindsText, noticeStatus && styles.nextBlindsNoticeText]}
                      >
                        {nextDurationText}
                      </Text>
                    </View>
                    <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      {<Pressable onPressIn={()=>Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)} style={[ , {flex: 2}]}><Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='restore' size={responsiveFontSize(3)}/>} onPress={() => resetTimerButtonPressed()}></Button></Pressable>}
                      {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='fast-rewind' size={responsiveFontSize(3)}/>} onPress={()=> rwdButtonPressed()}></Button>}
                      {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={ isActive ? <Icon name='pause' size={responsiveFontSize(3)}/> : <Icon name='play-arrow' size={responsiveFontSize(3)}/>} onPress={()=> toggleTimerButtonPressed()}></Button>}
                      {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={()=> fwdButtonPressed()}></Button>}
                    </View>
                  </View>
                <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', }}>
                  {displayChipArray.map((u,i) => {
                      return (
                        <Animated.View key={i} style={{flexDirection: 'column', justifyContent:'center', alignItems: 'center', flex: 1/displayChipArray.length, opacity: (newCSI + 1 <= u.segment) ? 1 : (chipFadeAnimation) }}>
                          <Icon name='poker-chip' color={u.color} type='material-community' size={responsiveFontSize(8)}/>
                          <Text style={[styles.chipText]} >{numberToSuffixedString(u.denom)}</Text>
                        </Animated.View>
                      )
                  })}
                </View>
              </LinearGradient>
            </View>
          </AppLayout>            
        }
      </>
    )
  }
}

export const TOURNAMENT_SUBSCRIPTION = gql`
  subscription TournamentSubscription($id: uuid!) {
    tournaments_by_pk(id: $id) {
    id
    title
    subtitle
    Chips {
      color
      denom
      id
      qtyAvailable
    }
    Segments {
      duration
      sBlind
      bBlind
      ante
      id
    }
    Costs {
      id
      price
      chipStack
      costType
    }
    Timers (limit: 1) {
      id
      active
      clock_updated_at
      created_at
      elapsed
      oneMinuteRemainingSpeech
      playOneMinuteRemainingSound
      endOfRoundSpeech
      playEndOfRoundSound
      backgroundColor
      lastAccessed
    }
    Segments_aggregate {
      aggregate {
        sum {
          duration
        }
      }
    }
  }
}
`
export const UPDATE_TIMER_MUTATION = gql`
  mutation updateTimer($id: uuid!, $active: Boolean!, $elapsed: Int!) {
    update_timers_by_pk(pk_columns: {id: $id}, _set: {active: $active, clock_updated_at: "=now()", elapsed: $elapsed, lastAccessed: "=now()"}) {
      id
      clock_updated_at
      active
      elapsed
    }
  }
`
export const JUMP_SEGMENT_MUTATION = gql`
  mutation advanceTimer($id: uuid!, $elapsed: Int!) {
    update_timers_by_pk(pk_columns: {id: $id}, _set: {clock_updated_at: "=now()", elapsed: $elapsed, lastAccessed: "=now()"}) {
      id
      clock_updated_at
      active
      elapsed
    }
  }
`
export const RESET_TIMER_MUTATION = gql`
  mutation resetTimer($id: uuid!) {
    update_timers_by_pk(pk_columns: {id: $id}, _set: {active: false, elapsed: "0", lastAccessed: "=now()", clock_updated_at: "=now()", }) {
      id
      clock_updated_at
      active
      elapsed
    }
  }
`