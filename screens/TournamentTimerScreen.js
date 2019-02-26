import { graphql, compose } from 'react-apollo'
import React from 'react'
import { Dimensions, Easing, Animated, ActivityIndicator, Text, View, ScrollView, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { Button, Avatar, Icon } from 'react-native-elements'
import { KeepAwake, Audio, AdMobInterstitial, LinearGradient, Speech, ScreenOrientation } from 'expo'
import { smallestChipArray, msToTime, numberToSuffixedString, tick, sortChips, sortSegments, responsiveFontSize, responsiveWidth, responsiveHeight} from '../utilities/functions'
import { currentUserQuery, getTournamentQuery, updateTournamentTimerMutation, getServerTimeMutation, tournamentSubscription, updateTournamentChildren} from '../constants/GQL'
import { GraphCoolConfig } from '../config'
import { BannerAd } from '../components/Ads'

class TournamentTimerScreen extends React.Component {

  static navigationOptions = {
    title: 'TourneyVision',
  }

  constructor(props) {
    super(props)
    ScreenOrientation.allowAsync(ScreenOrientation.Orientation.ALL);
    this.state = {
      orientation: this._isPortrait() ? 'portrait' : 'landscape',
      user: null,
      modalVisible: false,
      time: new Date(),
      ms: 0,
      display: 
        {
          timer: "00:00",
          currentBlinds: "---- / ----",
          currentAnte: "",
        },
      segment: {sBlind: 0, bBlind: 0, duration: 0, ante: 0},
      nextSegment: null,
      csi: null,
      currentDuration: 0,
      totalDuration: 0,
      percentage: 0,
      noticeStatus: false,
      offsetFromServerTime: null,
      timerActive: false,
      activity: null,
      endOfRoundSoundObject: null,
      timerCustomizations: {},
    }
    Dimensions.addEventListener('change', this._handleOrientationChange)
  }

  _handleOrientationChange = () => {
    this.setState({
      orientation: this._isPortrait() ? 'portrait' : 'landscape'
    })
  }

  _isPortrait = () => {
    const dim = Dimensions.get('screen')
    return dim.height >= dim.width
  }


  async componentDidMount() {
    const {oneMinuteRemainingSpeech, playOneMinuteRemainingSound, endOfRoundSpeech, playEndOfRoundSound, backgroundColor} = await this.props.getTournamentQuery.Tournament.timer
    this.setState({timerCustomizations: {oneMinuteRemainingSpeech, playOneMinuteRemainingSound, endOfRoundSpeech, playEndOfRoundSound, backgroundColor}})
    this.setState({user: this.props.currentUserQuery.user})
    this._loadSound()
    this.props.getServerTimeMutation( {variables: {id: GraphCoolConfig.timeNodeId, lastRequestedAt: new Date(), }}).then( ({data}) =>
      {
        this.setState({offsetFromServerTime: new Date().valueOf() - new Date(data.updateTime.updatedAt).valueOf()})
      }
    )
    this.recheckServerTime = setTimeout(()=> {
      this.props.getServerTimeMutation( {variables: {id: GraphCoolConfig.timeNodeId, lastRequestedAt: new Date(), }}).then( ({data}) =>
        {
          this.setState({offsetFromServerTime: new Date().valueOf() - new Date(data.updateTime.updatedAt).valueOf()})
        }
      )
    }, 5000)
    this.clockInterval = setInterval(()=> {
      const tickfunction = tick.bind(this)
      tickfunction(
        endOfRoundFunction = async () => { 
          try {
            await this.state.endOfRoundSoundObject.setStatusAsync({
              positionMillis: 0,
              volume: 1,
              rate: 0.5,
              shouldPlay: true,
              shouldCorrectPitch: false,
            })
            this.state.endOfRoundSoundObject.setOnPlaybackStatusUpdate((playbackStatus) => {
              if(playbackStatus.didJustFinish) {
                Speech.speak(
                  this.state.nextSegment && (this.state.timerCustomizations.endOfRoundSpeech + "The blinds are now " + (this.state.display.currentBlinds + this.state.display.currentAnte).replace("/", " and ")).replace("false","").replace("Ante: ", "with an ante of "), //this.state.nextSegment.sBlind.toLocaleString() + ', and ' + this.state.nextSegment.bBlind.toLocaleString()),
                  {
                    rate: 1.00,
                    pitch: 1,
                  }
                )
              }
            })
          } catch (error) {
            console.log(error)
          }
        },
        noticeSeconds = 60,
        noticeFunction = async () => { 
          try {
            await this.state.noticeSoundObject.setStatusAsync({
              positionMillis: 0,
              volume: 0.75,
              rate: 3,
              shouldPlay: true,
              shouldCorrectPitch: false,
            })
            this.state.noticeSoundObject.setOnPlaybackStatusUpdate((playbackStatus) => {
              if(playbackStatus.didJustFinish) {
                Speech.speak(
                  this.state.nextSegment && (this.state.timerCustomizations.oneMinuteRemainingSpeech),
                  {
                    rate: 1,
                    pitch: 1.00,
                  }
                )
              }
            })
          } catch (error) {
            console.log(error)
          }
        },
      )
    }, 100)
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
    this._animate()
  }

  async _loadSound() {
    try {
      const { sound: soundObject, status }  = await Audio.Sound.createAsync(
        require('../assets/sounds/3beeps.aiff'),
        {
          positionMillis: 0,
          volume: 0.3,
          rate: 2.5,
          shouldPlay: false,
          shouldCorrectPitch: false,        
        }
      )
      this.setState({endOfRoundSoundObject: soundObject})
      this.setState({noticeSoundObject: soundObject})
    } catch (error) {
      console.log(error)
    }
  }


  componentWillUnmount () {
    Dimensions.removeEventListener('change', this._handleOrientationChange)
    clearTimeout(this.recheckServerTime)
    clearInterval(this.clockInterval)
    // clearInterval(this.interstitialInterval)
  }

  _animate() {
    this.chipFadeAnimation = new Animated.Value(1)
    Animated.loop(
      Animated.sequence([    
        Animated.timing(
          this.chipFadeAnimation,
          {
            toValue: 0.2,
            duration: 2000,
            useNativeDriver: true,
            isInteraction: false,
          }
        ),
        Animated.timing(
          this.chipFadeAnimation,
            {
              toValue: 1,
              duration: 2000, 
              useNativeDriver: true,
              isInteraction: false,
            }
        ),

      ])
    ).start()    
  }

  async _toggleTimerButtonPressed(tourney) {
    this.setState({activity: 'toggling'})
    try {
      await this.props.updateTournamentTimerMutation({ variables: {
          id: tourney.timer.id,
          active: !(tourney.timer.active),
          elapsed: tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - this.state.offsetFromServerTime - new Date(tourney.timer.updatedAt).valueOf() : 0)
          } 
        }
      )
      await this.props.updateTournamentChildrenMutation({variables: {
          now: new Date(),
          id: tourney.id
          }
        }
      )
    } catch (error) {
      console.log(error)
    } finally {
      this.setState({activity: null})
      this._animate()
    }
  }

  async _fwdButtonPressed(tourney) {
    this.setState({activity: 'advancing'})
    try {
      await this.props.updateTournamentTimerMutation({ variables: {
        id: tourney.timer.id,
        elapsed: this.state.ms + tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - this.state.offsetFromServerTime - new Date(tourney.timer.updatedAt).valueOf() : 0)
      }})
      await this.props.updateTournamentChildrenMutation({variables: {
        now: new Date(),
        id: tourney.id
      }})
    } catch (error) {
      console.log(error)
    } finally {
      this.setState({activity: null})
      this._animate()
    }
  }



  async _resetTimerButtonPressed(tourney) {
    this.setState({activity: 'resetting'})
    try {
      await this.props.updateTournamentTimerMutation({ variables: {
        id: tourney.timer.id,
        active: false,
        elapsed: 0
        } 
      })
      await this.props.updateTournamentChildrenMutation({variables: {
        now: new Date(),
        id: tourney.id
        }
      })
    } catch (error) {
      console.log(error)
    } finally {
      this.setState({activity: null})
      this._animate()
    }
  }

  render() {
    const { getTournamentQuery: { loading, error, Tournament }, navigation } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!  {error.message}</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const chips = sortChips(Tournament.chips)
      const segments = sortSegments(Tournament.segments)
      const smallestChipReq = smallestChipArray(chips, segments)
      const segment = this.state.segment && this.state.segment
      const nextSegment = this.state.nextSegment && this.state.nextSegment

      return (
        <View style={[{flex: 1, flexDirection: 'column', justifyContent: 'space-around'}]}>
          <KeepAwake/>
          <View style={{flex: 1, flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', }}>
            <Text style={[{flex: 1}, styles.titleText]}>{Tournament.title}</Text>
          </View>
          <LinearGradient
            colors={['#194a2f', '#257a25', '#194a2f']}
            style={{ flex: 11, margin: responsiveFontSize(1), padding: responsiveFontSize(1), borderRadius: responsiveFontSize(3) }}
          >
            <View style={{flex: 8, flexDirection:'row', }}>
              <View style={{flex: this.state.orientation == 'portrait' ? 2 : 1, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'flex-end', paddingLeft: 5}}>
                {this.state.orientation == 'landscape' && chips.map((u,i) => {
                  if (this.state.csi <= smallestChipReq[i].segment || smallestChipReq[i].segment < 0) {
                    return (
                      <Animated.View key={i} style={{flexDirection: 'row', alignItems: 'center', opacity: (this.state.csi + 1 <= smallestChipReq[i].segment) ? 1 : this.chipFadeAnimation}}>
                        <Text style={[styles.chipText]} >{numberToSuffixedString(u.denom)}  </Text>
                        <Icon name='circle' color={u.color} type='font-awesome' size={responsiveFontSize(5)}/>
                      </Animated.View>
                    )
                  }
                })}
              </View>
              <View style={{flex: 4, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',}}>
                <View style={{flex: 5, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center', }}>
                  <Text
                    style={[styles.blindsText, this.state.noticeStatus && styles.blindsNoticeText]}
                  >
                    {this.state.display.currentBlinds}
                  </Text>
                  {this.state.display.currentAnte != null && 
                    <Text
                     style={[styles.anteText, this.state.noticeStatus && styles.blindsNoticeText]}
                    >
                      {this.state.display.currentAnte}
                    </Text>
                  }
                  <Text 
                    style={[styles.timerText, this.state.noticeStatus && styles.timerNoticeText]}
                  >
                    {this.state.display.timer}
                  </Text>
                </View>
                <View style={{flex: 4, flexDirection: 'column',  justifyContent: 'space-evenly', alignItems: 'center', }}>
                  <Text
                    style={[styles.nextBlindsText, this.state.noticeStatus && styles.nextBlindsNoticeText]}
                  >
                    Next Blinds:
                  </Text>
                  <Text
                    style={[styles.nextBlindsText, this.state.noticeStatus && styles.nextBlindsNoticeText]}
                  >
                    {this.state.nextSegment && (this.state.nextSegment.sBlind.toLocaleString() + '/' + this.state.nextSegment.bBlind.toLocaleString())}
                    {!this.state.nextSegment && ("No more levels scheduled.")}
                  </Text>
                  <Text 
                    style={[styles.nextBlindsText, this.state.noticeStatus && styles.nextBlindsNoticeText]}
                  >
                    {this.state.nextSegment && this.state.nextSegment.ante && ("Ante: " + this.state.nextSegment.ante.toLocaleString())}
                  </Text>
                </View>
                { !this.state.activity && this.state.orientation == 'portrait' &&
                  <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='restore' size={responsiveFontSize(3)}/>} onPress={this._resetTimerButtonPressed.bind(this, Tournament)}></Button>}
                    {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={this.state.timerActive ? <Icon name='pause' size={responsiveFontSize(3)}/> : <Icon name='play-arrow' size={responsiveFontSize(3)}/>} onPress={this._toggleTimerButtonPressed.bind(this, Tournament)}></Button>}
                    {<Button containerStyle={{flex: 2}} title="" buttonStyle={{ backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={this._fwdButtonPressed.bind(this, Tournament)}></Button>}
                  </View>
                }
                { this.state.activity && this.state.orientation == 'portrait' &&
                  <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <ActivityIndicator/>
                  </View>
                }
              </View>
              <View style={{flex: this.state.orientation == 'portrait' ? 2 : 1, flexDirection: 'column', paddingRight: 5}}>
                { !this.state.activity && this.state.orientation == 'landscape' &&
                  <View style={{flex: 2, flexDirection: 'column', justifyContent: 'space-evenly', alignItems: 'center'}}>
                    {<Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='restore' size={responsiveFontSize(3)}/>} onPress={this._resetTimerButtonPressed.bind(this, Tournament)}></Button>}
                    {<Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={this.state.timerActive ? <Icon name='pause' size={responsiveFontSize(3)}/> : <Icon name='play-arrow' size={responsiveFontSize(3)}/>} onPress={this._toggleTimerButtonPressed.bind(this, Tournament)}></Button>}
                    {<Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={this._fwdButtonPressed.bind(this, Tournament)}></Button>}
                  </View>
                }
                { this.state.activity && this.state.orientation == 'landscape' &&
                  <View style={{flex: 2, flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center'}}>
                    <ActivityIndicator/>
                  </View>
                }
              </View>
            </View>
            {this.state.orientation == 'portrait' && 
              <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', }}>
                {chips.map((u,i) => {
                 if (this.state.csi <= smallestChipReq[i].segment || smallestChipReq[i].segment < 0) {
                    return (
                      <Animated.View key={i} style={{flexDirection: 'column', justifyContent:'center', alignItems: 'center', opacity: (this.state.csi + 1 <= smallestChipReq[i].segment) ? 1 : this.chipFadeAnimation}}>
                        <Icon name='circle' color={u.color} type='font-awesome' size={responsiveFontSize(6)}/>
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
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournamentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(getServerTimeMutation, { name: 'getServerTimeMutation', }),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(updateTournamentTimerMutation, {name: 'updateTournamentTimerMutation'}),
  graphql(updateTournamentChildren, {name: 'updateTournamentChildrenMutation'})
)(TournamentTimerScreen)


const styles = StyleSheet.create({
  blindsText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(10), responsiveWidth(10)),
  },
  anteText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(8), responsiveWidth(8)),
  },
  blindsNoticeText: {
    fontWeight: '300',
  },
  nextBlindsText: {
    color: 'rgba(30,30,30,1)',
    fontSize: Math.min(responsiveHeight(7), responsiveWidth(7)),
    textAlign: 'center',
  },
  nextBlindsNoticeText: {
    color: 'red',
  },
  timerText: {
    color: 'rgba(225,225,225,1)',
    fontFamily: 'Menlo',
    fontSize: Math.min(responsiveHeight(9), responsiveWidth(9)),
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