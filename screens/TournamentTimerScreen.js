import React, { useState, useEffect } from 'react'
import { Animated, ActivityIndicator, Text, View, StyleSheet, } from 'react-native'
import { Button, Icon } from 'react-native-elements'
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import { activateKeepAwake, deactivateKeepAwake, useKeepAwake} from 'expo-keep-awake';
import { smallestChipArray, msToTime, numberToSuffixedString, sortChips, sortSegments, responsiveFontSize, responsiveWidth, responsiveHeight} from '../utilities/functions'
import { currentUserQuery, getTournamentQuery, toggleTournamentTimerMutation, jumpTournamentSegmentMutation, resetTournamentTimerMutation, getServerTimeMutation, } from '../constants/GQL'
import { GraphCoolConfig } from '../config'
import { BannerAd } from '../components/Ads'
import { useQuery, useMutation, } from '@apollo/client'
import useDimensions from '@rnhooks/dimensions'

export default ((props) => {
  const { data, loading, error, } = useQuery(getTournamentQuery, { variables: { id: props.navigation.getParam('id')}})
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
  const [ toggleTournamentTimer ] = useMutation(toggleTournamentTimerMutation, {})
  const [ jumpTournamentSegment ] = useMutation(jumpTournamentSegmentMutation, {})
  const [ resetTournamentTimer ] = useMutation(resetTournamentTimerMutation, {})
  const [ getServerTime] = useMutation(getServerTimeMutation, {})
  const [ ms, setMs] = useState(0)
  const [ display, setDisplay] = useState ({timer: "--:--", currentBlinds: "--/--", currentAnte: "", })
  const [ nextSegment, setNextSegment ] = useState({sBlind: "", bBlind: "", ante: ""})
  const [ csi, setCsi ] = useState(null)
  const [ noticeStatus, setNoticeStatus ] = useState(false)
  const [ offsetFromServerTime, setOffsetFromServerTime ] = useState(null)
  const [ timerActive, setTimerActive ] = useState(false)
  const { fontScale, width, height, scale } = useDimensions('screen')

  useKeepAwake('timer') // TODO: look at using deactivateKeepAwake('timer') if battery gets too low. What about the alarms in that scenario, though?

  useEffect(() => {
    const getServerTimeFunction = () => {
      getServerTime({
        variables: {
          id: GraphCoolConfig.timeNodeId, 
          lastRequestedAt: new Date(),
        },
        update: (cache, mutationResponse) => {
          const { data: { updateTime: {updatedAt} }} = mutationResponse
          setOffsetFromServerTime(new Date().valueOf() - new Date(updatedAt).valueOf())
        },
      })
    }
    getServerTimeFunction()
    const checkServerTimeInterval = setInterval(getServerTimeFunction, 60000)
    return cleanup = () => clearInterval(checkServerTimeInterval)
  }, [data])

  tick = (noticeSeconds) => {
    if (loading || error ) {return}
    const msPerMinute = 60 * 1000
    const noticeMilliseconds = noticeSeconds * 1000
    const { Tournament } = data
    let { segments, timer}  = Tournament
    segments = sortSegments(segments)
    const time = new Date()
    const totalElapsedMS = Math.max(0,timer.active ? timer.elapsed + time.valueOf() - offsetFromServerTime - new Date(timer.updatedAt).valueOf() : timer.elapsed)
    var cumulativeMS = 0
    var currentSegmentIndex = null
    for (var i = 0, len = segments.length; i < len; i++) {
      if (totalElapsedMS >= cumulativeMS && totalElapsedMS < (cumulativeMS + segments[i].duration * msPerMinute)) {
        currentSegmentIndex = i
        break
      }
      cumulativeMS += segments[i].duration * msPerMinute
    }
    if(currentSegmentIndex==null) {
      setMs(0)
      setDisplay({timer: "", currentBlinds: "", currentAnte: ""})
      setNextSegment(null)
      setCsi(segments.length-1)
      setNoticeStatus(false)
      setTimerActive(false)
      return
    }
    const duration = cumulativeMS + segments[currentSegmentIndex].duration * msPerMinute
    const ms = duration - totalElapsedMS
    // setTime(time)
    setMs(ms)
    setDisplay({
      timer: timer.active ? msToTime(ms + 999) : msToTime(ms),
      currentBlinds: numberToSuffixedString(segments[currentSegmentIndex].sBlind) + '/' + numberToSuffixedString(segments[currentSegmentIndex].bBlind),
      currentAnte: segments[currentSegmentIndex].ante != null && "Ante: " + numberToSuffixedString(segments[currentSegmentIndex].ante)
    })
    if (currentSegmentIndex > csi && currentSegmentIndex > 0 && csi != null && timerActive && ms > 30000) { // using ms>30000 (30 seconds) to avoid multiple calls
      endOfRoundFunction(timer.endOfRoundSpeech || "")
    } else if (ms < noticeMilliseconds && ms >= noticeMilliseconds && timerActive && ms > noticeMilliseconds - 1000) {
      noticeFunction(timer.oneMinuteRemainingSpeech || "One minute remaining in this round.")
    }
    setNextSegment(currentSegmentIndex < segments.length -1 ? segments[currentSegmentIndex + 1] : null)
    setCsi(currentSegmentIndex)
    setNoticeStatus(ms < noticeMilliseconds)
    setTimerActive(timer.active)
  }
  
  endOfRoundFunction = async (customSpeech="") => { 
    try {
      const { sound: soundObject, status }  = await Audio.Sound.createAsync(
        require('../assets/sounds/3beeps.aiff'),
        {
          positionMillis: 0,
          volume: 0.7,
          rate: 0.75,
          shouldPlay: true,
          shouldCorrectPitch: false,
        },
        (playbackStatus) => {
          if (playbackStatus.didJustFinish) {
            Speech.speak(
              (customSpeech + "The blinds are now " + (display.currentBlinds + display.currentAnte).replace("/", " and ")).replace("false","").replace("Ante: ", "with an ante of "),
              {
                rate: 1.00,
                pitch: 1,
                onDone: async () => {
                  const { sound: soundObject, status }  = await Audio.Sound.createAsync(
                    require('../assets/sounds/500msSilence.mp3'),
                    {
                      rate: 4,
                      positionMillis: 0,
                      volume: 1,
                      shouldPlay: true,
                    },
                  )                 
                }
              }
            )
          }
        }
      )
    } catch (error) {
      console.log(error)
    }
  }

  noticeFunction = async (customSpeech="") => { 
    try {
      const { sound: soundObject, status }  = await Audio.Sound.createAsync(
        require('../assets/sounds/3beeps.aiff'),
        {
          positionMillis: 0,
          volume: 0.7,
          rate: 3,
          shouldPlay: true,
          shouldCorrectPitch: false,        
        }
      )
      soundObject.setOnPlaybackStatusUpdate((playbackStatus) => {
        if (playbackStatus.isPlaying && playbackStatus.positionMillis >= playbackStatus.durationMillis - playbackStatus.progressUpdateIntervalMillis) {
          Speech.speak(
            (customSpeech),
            {
              rate: 1.00,
              pitch: 1,
              onDone: async () => {
                const { sound: soundObject, status }  = await Audio.Sound.createAsync(
                  require('../assets/sounds/500msSilence.mp3'),
                  {
                    positionMillis: 0,
                    volume: 1,
                    shouldPlay: true,
                  },
                )                 
              }
            }
          )
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  
  useEffect(() => {
    clockInterval = setInterval(()=> {
      tick(
        noticeSeconds = 60,
      )
    }, 1000)
    return cleanup = () => clearInterval(clockInterval)
  }, [])

  animate = () => {
    chipFadeAnimation = new Animated.Value(1)
    Animated.loop(
      Animated.sequence([    
        Animated.timing(
          chipFadeAnimation,
          {
            toValue: 0.3,
            duration: 2500,
            useNativeDriver: true,
            isInteraction: false,
          }
        ),
        Animated.timing(
          chipFadeAnimation,
            {
              toValue: 0.7,
              duration: 2500, 
              useNativeDriver: true,
              isInteraction: false,
            }
        ),
      ])
    ).start()    
  }

  useEffect(() => {animate()},[data])

  toggleTimerButtonPressed = async (tourney) => {
    toggleTournamentTimer({
      variables: {
        id: tourney.timer.id,
        active: !(tourney.timer.active),
        elapsed: tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - offsetFromServerTime - new Date(tourney.timer.updatedAt).valueOf() : 0),
      },
      optimisticResponse: {
        updateTimer: {
          '__typename': 'Timer',
          id: tourney.timer.id,
          active: (!tourney.timer.active),
          updatedAt: new Date(),
          elapsed: tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - offsetFromServerTime - new Date(tourney.timer.updatedAt).valueOf() : 0),
        }
      },
      update: (cache, mutationResponse) => {
        try {
          const { data: { updateTimer }} = mutationResponse
          let cacheData = cache.readQuery({
            query: getTournamentQuery, 
            variables: { id: props.navigation.getParam('id')}
           })
          cacheData = {
            Tournament: {
              ...cacheData.Tournament,
              timer: {...cacheData.Tournament.timer, ...updateTimer}
            }
          }
          cache.writeQuery({
            query: getTournamentQuery, 
            variables: {id: props.navigation.getParam('id')},
            data: cacheData, 
          })
        } catch (error) {
          console.log('error: ' + error.message)
        }        
      }
    })
  }

  fwdButtonPressed = async (tourney) => {
    jumpTournamentSegment({
      variables: {
        id: tourney.timer.id,
        elapsed: ms + tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - offsetFromServerTime - new Date(tourney.timer.updatedAt).valueOf() : 0),
      },
      // optimisticResponse: {
      //   updateTimer: {
      //     '__typename': 'Timer',
      //     id: tourney.timer.id,
      //     elapsed: ms + tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - offsetFromServerTime - new Date(tourney.timer.updatedAt).valueOf() : 0),
      //     active: tourney.timer.active,
      //     updatedAt: new Date(),
      //   }
      // },
      update: (cache, mutationResponse) => {
        try {
          const { data: { updateTimer }} = mutationResponse
          let cacheData = cache.readQuery({
            query: getTournamentQuery, 
            variables: { id: props.navigation.getParam('id')}
           })
          cacheData = {
            Tournament: {
              ...cacheData.Tournament,
              timer: {...cacheData.Tournament.timer, ...updateTimer}
            }
          }
          cache.writeQuery({
            query: getTournamentQuery, 
            variables: {id: props.navigation.getParam('id')},
            data: cacheData, 
          })
        } catch (error) {
          console.log('error: ' + error.message)
        }        
      }
    })
  }

  resetTimerButtonPressed = async (tourney) => {
    resetTournamentTimer({
      variables: {
        id: tourney.timer.id,
      },
      optimisticResponse: {
        updateTimer: {
          '__typename': 'Timer',
          id: tourney.timer.id,
          elapsed: 0,
          active: false,
          updatedAt: new Date(),
        }
      },
      update: (cache, mutationResponse) => {
        try {
          const { data: { updateTimer }} = mutationResponse
          let cacheData = cache.readQuery({
            query: getTournamentQuery, 
            variables: { id: props.navigation.getParam('id')}
           })
          cacheData = {
            Tournament: {
              ...cacheData.Tournament,
              timer: {...cacheData.Tournament.timer, ...updateTimer}
            }
          }
          cache.writeQuery({
            query: getTournamentQuery, 
            variables: {id: props.navigation.getParam('id')},
            data: cacheData, 
          })
        } catch (error) {
          console.log('error: ' + error.message)
        }        
      }
    })
  }


  if (loading || loadingUser) {
    return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
  } else if (error || errorUser) {
    return <Text>Error! {error && error.message} {errorUser && errorUser.message}</Text>
  } else {
    const { user } = dataUser
    const { Tournament } = data
    const { timer } = Tournament
    const { active, oneMinuteRemainingSpeech, playOneMinuteRemainingSound, endOfRoundSpeech, playEndOfRoundSound, backgroundColor } = timer
    const chips = sortChips(Tournament.chips)
    const segments = sortSegments(Tournament.segments)
    const smallestChipReq = smallestChipArray(chips, segments)
    const userIsOwner = true //dataUser && (dataUser.id == Tournament.user.id)
    const orientation = height > width ? 'portrait' : 'landscape'
    return (
      <View style={[{flex: 1, flexDirection: 'column', justifyContent: 'space-around'}]}>
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
          <Text style={[{flex: 1}, styles.titleText]}>{Tournament.title}</Text>
        </View>
        <LinearGradient
          colors={[ '#257a2f', '#194a2f', '#226a2f' ]}
          style={{ flex: 11, margin: responsiveFontSize(1), padding: responsiveFontSize(1), borderRadius: responsiveFontSize(3) }}
        >
          <View style={{flex: 8, flexDirection:'row', }}>
            <View style={{flex: orientation == 'portrait' ? 2 : 1, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'flex-end', paddingLeft: 5}}>
              {orientation == 'landscape' && chips.map((u,i) => {
                if (csi <= smallestChipReq[i].segment || smallestChipReq[i].segment < 0) {
                  return (
                    <Animated.View key={i} style={{flexDirection: 'row', alignItems: 'center', opacity: (csi + 1 <= smallestChipReq[i].segment) ? 1 : (chipFadeAnimation || 1) }}>{/* chipFadeAnimation}}> TODO: Re-enable chipFadeAnimation*/}
                      <Text style={[styles.chipText]} >{numberToSuffixedString(u.denom)}  </Text>
                      <Icon name='poker-chip' color={u.color} type='material-community' size={responsiveFontSize(5)}/>
                    </Animated.View>
                  )
                }
              })}
            </View>
            <View style={{flex: 4, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',}}>
              <View style={{flex: 5, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', }}>
                <Text
                  style={[styles.blindsText, noticeStatus && styles.blindsNoticeText]}
                >
                  {display.currentBlinds}
                </Text>
                {display.currentAnte != null && 
                  <Text
                    style={[styles.anteText, noticeStatus && styles.blindsNoticeText]}
                  >
                    {display.currentAnte}
                  </Text>
                }
                <Text 
                  style={[styles.timerText, noticeStatus && styles.timerNoticeText]}
                >
                  {display.timer}
                </Text>
              </View>
              <View style={{flex: 4, flexDirection: 'column',  justifyContent: 'space-evenly', alignItems: 'center', }}>
                <Text
                  style={[styles.nextBlindsText, noticeStatus && styles.nextBlindsNoticeText]}
                >
                  {nextSegment && ('Next Blinds: ' + nextSegment.sBlind.toLocaleString() + '/' + nextSegment.bBlind.toLocaleString() + (nextSegment.ante ? "Ante: " + nextSegment.ante.toLocaleString() : ""))}
                  {!nextSegment && ("End")}
                </Text>
              </View>
              { orientation == 'portrait' && userIsOwner &&
                <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                  {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='restore' size={responsiveFontSize(3)}/>} onPress={() => resetTimerButtonPressed(Tournament)}></Button>}
                  {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={ active ? <Icon name='pause' size={responsiveFontSize(3)}/> : <Icon name='play-arrow' size={responsiveFontSize(3)}/>} onPress={()=> toggleTimerButtonPressed(Tournament)}></Button>}
                  {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={()=> fwdButtonPressed(Tournament)}></Button>}
                </View>
              }
            </View>
            <View style={{flex: orientation == 'portrait' ? 2 : 1, flexDirection: 'column', paddingRight: 5}}>
              { orientation == 'landscape' && userIsOwner &&
                <View style={{flex: 2, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center'}}>
                  {<Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='restore' size={responsiveFontSize(3)}/>} onPress={()=> resetTimerButtonPressed(Tournament)}></Button>}
                  {<Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={ active ? <Icon name='pause' size={responsiveFontSize(3)}/> : <Icon name='play-arrow' size={responsiveFontSize(3)}/>} onPress={()=> toggleTimerButtonPressed(Tournament)}></Button>}
                  {<Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={()=> fwdButtonPressed(Tournament)}></Button>}
                </View>
              }
            </View>
          </View>
          {orientation == 'portrait' && 
            <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', }}>
              {chips.map((u,i) => {
                if (csi <= smallestChipReq[i].segment || smallestChipReq[i].segment < 0) {
                  return (
                    <Animated.View key={i} style={{flexDirection: 'column', justifyContent:'center', alignItems: 'center', opacity: (csi + 1 <= smallestChipReq[i].segment) ? 1 : (chipFadeAnimation || 1) }}>{/* chipFadeAnimation}}> TODO: Re-enable chipFadeAnimation*/}
                      <Icon name='poker-chip' color={u.color} type='material-community' size={responsiveFontSize(6)}/>
                      <Text style={[styles.chipText]} >{numberToSuffixedString(u.denom)}</Text>
                    </Animated.View>
                  )
                }
              })}
            </View>
          }
        </LinearGradient>
        <BannerAd/>
      </View>
    )
  }
})

const styles = StyleSheet.create({
  blindsText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(12), responsiveWidth(12)),
  },
  anteText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(8), responsiveWidth(8)),
  },
  blindsNoticeText: {
    fontWeight: '300',
  },
  nextBlindsText: {
    color: 'rgba(150,150,150,1)',
    fontSize: Math.min(responsiveHeight(5), responsiveWidth(5)),
    textAlign: 'center',
  },
  nextBlindsNoticeText: {
    color: 'red',
  },
  timerText: {
    color: 'rgba(225,225,225,1)',
    fontFamily: 'Menlo',
    fontSize: Math.min(responsiveHeight(10), responsiveWidth(10)),
  },
  timerNoticeText: {
    color: 'red',
  },
  titleText: {
    fontSize: Math.min(responsiveHeight(4.5), responsiveWidth(4.5)),
    color: '#000',
  },
  chipText: {
    fontSize: responsiveFontSize(2.5),
    color: 'rgba(225,225,225,1)',
  }
})