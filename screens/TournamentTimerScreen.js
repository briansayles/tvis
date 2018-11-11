import { graphql, compose } from 'react-apollo'
import React from 'react'
import { Easing, Animated, ActivityIndicator, Text, View, ScrollView, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { Button, Avatar, Icon } from 'react-native-elements'
import { KeepAwake, Audio, AdMobInterstitial, LinearGradient, Speech } from 'expo'
import { smallestChipArray, msToTime, numberToSuffixedString, tick, sortChips, sortSegments, responsiveFontSize, responsiveWidth, responsiveHeight} from '../utilities/functions'
import { currentUserQuery, getTournamentQuery, updateTournamentTimerMutation, getServerTimeMutation, tournamentSubscription} from '../constants/GQL'
import { GraphCoolConfig } from '../config'
import { BannerAd } from '../components/Ads'

class TournamentTimerScreen extends React.Component {

  static navigationOptions = {
    title: 'TourneyVision'
  }

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      modalVisible: false,
      time: new Date(),
      ms: 0,
      display: 
        {
          timer: "00:00",
          currentBlinds: "---- / ----",
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
    }
  }

  componentDidMount() {
    // AdMobInterstitial.setAdUnitID('ca-app-pub-3013833975597353/7633439481'); // Test ID, Replace with your-admob-unit-id
    // AdMobInterstitial.setTestDeviceID('EMULATOR');
    // AdMobInterstitial.requestAdAsync(() => AdMobInterstitial.showAdAsync())
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
    // this.interstitialInterval = setInterval(() => {
    //   AdMobInterstitial.setAdUnitID('ca-app-pub-3013833975597353/7633439481'); // Test ID, Replace with your-admob-unit-id
    //   AdMobInterstitial.setTestDeviceID('EMULATOR');
    //   AdMobInterstitial.requestAdAsync(() => AdMobInterstitial.showAdAsync())
    // }, 5 * 60000)
    this.clockInterval = setInterval(()=> {
      const tickfunction = tick.bind(this)
      tickfunction(
        endOfRoundFunction = async () => { 
          try {
            await this.state.endOfRoundSoundObject.setStatusAsync({
              positionMillis: 0,
              volume: 0.8,
              rate: 0.5,
              shouldPlay: true,
              shouldCorrectPitch: false,
            })
            this.state.endOfRoundSoundObject.setOnPlaybackStatusUpdate((playbackStatus) => {
              if(playbackStatus.didJustFinish) {
                Speech.speak(
                  this.state.nextSegment && ("The blinds are now " + this.state.display.currentBlinds), //this.state.nextSegment.sBlind.toLocaleString() + ', and ' + this.state.nextSegment.bBlind.toLocaleString()),
                  {
                    rate: 0.85,
                    pitch: 1.00,
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
              volume: 0.3,
              rate: 3,
              shouldPlay: true,
              shouldCorrectPitch: false,
            })
            this.state.noticeSoundObject.setOnPlaybackStatusUpdate((playbackStatus) => {
              if(playbackStatus.didJustFinish) {
                Speech.speak(
                  this.state.nextSegment && ("One minute remaining in this round."),
                  {
                    rate: 0.85,
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
    this.updateTournamentSubscription = this.props.getTournamentQuery.subscribeToMore({
      document: tournamentSubscription,
      updateQuery: (previous, {subscriptionData}) => {
        this.props.getTournamentQuery.refetch()
        return
      },
      onError: (err) => {
        console.error(err)
      },
    })
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery) {
      const user = nextProps.currentUserQuery.user || null
      this.setState({user: user})
    }
  }
  
  componentDidUpdate(prevProps) {
  }

  componentWillUnmount () {
    clearTimeout(this.recheckServerTime)
    clearInterval(this.clockInterval)
    clearInterval(this.interstitialInterval)
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

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible})
  }

  _toggleTimerButtonPressed() {
    this.setState({activity: 'toggling'})
    const tourney = this.props.getTournamentQuery.Tournament
    this.props.updateTournamentTimerMutation(
      { variables: {
        id: tourney.timer.id,
        now: new Date(), 
        active: !tourney.timer.active,
        tournamentId: tourney.id,
        elapsed: tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - this.state.offsetFromServerTime - new Date(tourney.timer.updatedAt).valueOf() : 0)
        } 
      }
    ).then(()=>{
      this.props.getTournamentQuery.refetch().then(()=>this.setState({activity: null})).catch(()=>this.setState({activity: null}))
    })
    this._animate()
  }

  _fwdButtonPressed() {
    this.setState({activity: 'advancing'})
    const tourney = this.props.getTournamentQuery.Tournament
    this.props.updateTournamentTimerMutation(
      { variables: {
        id: tourney.timer.id,
        now: new Date(),
        tournamentId: tourney.id,
        elapsed: this.state.ms + tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - this.state.offsetFromServerTime - new Date(tourney.timer.updatedAt).valueOf() : 0)

        }
      }
    ).then(()=>{
      this.props.getTournamentQuery.refetch().then(()=>this.setState({activity: null})).catch(()=>this.setState({activity: null}))
    })
    this._animate()
  }

  _resetTimerButtonPressed() {
    this.setState({activity: 'resetting'})
    const tourney = this.props.getTournamentQuery.Tournament
    this.props.updateTournamentTimerMutation(
      { variables: {
        id: tourney.timer.id,
        now: new Date(), 
        active: false,
        tournamentId: tourney.id,
        elapsed: 0
        } 
      }
    ).then(()=>{
      this.props.getTournamentQuery.refetch().then(()=>this.setState({activity: null})).catch(()=>this.setState({activity: null}))
    })
    this._animate()
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

          <LinearGradient
            colors={['#194a2f', '#257a25', '#194a2f']}
            style={{ flex: 1, margin: responsiveFontSize(1), paddingTop: responsiveFontSize(1), borderRadius: responsiveFontSize(3) }}
          >
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
              <Text style={[{flex: 1}, styles.titleText]}>{Tournament.title}</Text>
            </View>
            <View style={{flex: 8, flexDirection:'row', }}>
              <View style={{flex: 2, flexDirection: 'column', paddingLeft: 5}}>
              </View>
              <View style={{flex: 4, flexDirection: 'column', }}>
                {Tournament.game != "CAP" && 
                  <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                    <Text
                      style={[{flex: 1}, styles.blindsText, this.state.noticeStatus && styles.blindsNoticeText]}
                    >
                      {this.state.display.currentBlinds}
                    </Text>
                  </View>
                }
                {Tournament.game == "CAP" &&
                  <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                    <Text
                      style={[{flex: 1}, styles.blindsText, this.state.noticeStatus && styles.blindsNoticeText]}
                    >
                      {
                        segment.sBlind == 0 && ( "Cool " + segment.bBlind)
                      }
                      {
                        segment.sBlind != 0 && segment.bBlind == 1 && ("Cap #" + segment.sBlind/10 + ".\n")
                      }
                      {
                        segment.sBlind != 0 && segment.bBlind == 2 && ("Prepare Next")
                      }
                      {
                        segment.sBlind != 0 && segment.bBlind == 3 && ("SWAP")
                      }
                    </Text>
                  </View>
                }
                <View style={{flex: 3, flexDirection: 'row',  justifyContent: 'center', alignItems: 'center', }}>
                  <Text 
                    style={[{flex: 1}, styles.timerText, this.state.noticeStatus && styles.timerNoticeText]}
                  >
                    {this.state.display.timer}
                  </Text>
                </View>
                {Tournament.game != "CAP" && 
                  <View style={{flex: 1, flexDirection: 'row',  justifyContent: 'center', alignItems: 'center', }}>
                    <Text
                      style={[{flex: 1}, styles.nextBlindsText, this.state.noticeStatus && styles.nextBlindsNoticeText]}
                    >
                      Next Blinds:
                    </Text>
                  </View>
                }
                {Tournament.game != "CAP" && 
                  <View style={{flex: 2, flexDirection: 'row',  justifyContent: 'center', alignItems: 'center', }}>
                    <Text
                      style={[{flex: 1}, styles.nextBlindsText, this.state.noticeStatus && styles.nextBlindsNoticeText]}
                    >
                      {this.state.nextSegment && (this.state.nextSegment.sBlind.toLocaleString() + '/' + this.state.nextSegment.bBlind.toLocaleString())}
                      {!this.state.nextSegment && ("No more levels scheduled.")}
                    </Text>
                  </View>
                }
                {Tournament.game == "CAP" && 
                  <View style={{flex: 1, flexDirection: 'row',  justifyContent: 'center', alignItems: 'center', }}>
                    <Text
                      style={[{flex: 1}, styles.nextBlindsText, this.state.noticeStatus && styles.nextBlindsNoticeText]}
                    >
                      Next:
                    </Text>
                  </View>
                }
                {Tournament.game == "CAP" && nextSegment && 
                  <View style={{flex: 3, flexDirection: 'row',  justifyContent: 'center', alignItems: 'center', }}>
                    <Text
                      style={[{flex: 1}, styles.nextBlindsText, this.state.noticeStatus && styles.nextBlindsNoticeText]}
                    >
                      {
                        nextSegment.sBlind == 0 && ( "Cool " + nextSegment.bBlind)
                      }
                      {
                        nextSegment.sBlind != 0 && nextSegment.bBlind == 1 && ("Cap #" + nextSegment.sBlind/10 + ".\n")
                      }
                      {
                        nextSegment.sBlind != 0 && nextSegment.bBlind == 2 && ("Prepare Next")
                      }
                      {
                        nextSegment.sBlind != 0 && nextSegment.bBlind == 3 && ("SWAP")
                      }                  
                    </Text>
                  </View>
                }

                { !this.state.activity &&
                  <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                    {userIsOwner && <Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='restore' size={responsiveFontSize(3)}/>} onPress={this._resetTimerButtonPressed.bind(this)}></Button>}
                    {userIsOwner && <Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={this.state.timerActive ? <Icon name='pause' size={responsiveFontSize(3)}/> : <Icon name='play-arrow' size={responsiveFontSize(3)}/>} onPress={this._toggleTimerButtonPressed.bind(this)}></Button>}
                    {userIsOwner && <Button title="" buttonStyle={{backgroundColor: 'transparent'}} icon={<Icon name='fast-forward' size={responsiveFontSize(3)}/>} onPress={this._fwdButtonPressed.bind(this)}></Button>}
                  </View>
                }

                { this.state.activity &&
                  <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                    <ActivityIndicator/>
                  </View>
                }
               </View>
              <View style={{flex: 2, flexDirection: 'column', paddingRight: 5}}>
              </View>
            </View>
            {Tournament.game != "CAP" && 
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
)(TournamentTimerScreen)


const styles = StyleSheet.create({
  blindsText: {
    color: 'rgba(225,225,225,1)',
    fontSize: Math.min(responsiveHeight(10), responsiveWidth(10)),
    textAlign: 'center',
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
    textAlign: 'center',
  },
  timerNoticeText: {
    color: 'red',
  },
  titleText: {
    fontSize: Math.min(responsiveHeight(5), responsiveWidth(5)),
    color: '#fff',
    textAlign: 'center',
  },
  chipText: {
    fontSize: responsiveFontSize(2.5),
    color: 'rgba(225,225,225,1)',
  }
})