import {graphql, compose} from 'react-apollo'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import {Button, Avatar} from 'react-native-elements'
import { KeepAwake, Audio } from 'expo'
import {msToTime, numberToSuffixedString, tick, sortChips, responsiveFontSize, responsiveWidth, responsiveHeight} from '../utilities/functions'
import {currentUserQuery, getTournamentQuery, updateTournamentTimerMutation, getServerTimeMutation, tournamentSubscription} from '../constants/GQL'
import {GraphCoolConfig} from '../config'
import { BannerAd } from '../screens/Ads'

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
    }
  }

  componentDidMount() {
    this._loadSound()
    this.props.getServerTimeMutation( {variables: {id: GraphCoolConfig.timeNodeId, lastRequestedAt: new Date(), }}).then( ({data}) =>
      {
        this.setState({offsetFromServerTime: new Date().valueOf() - new Date(data.updateTime.updatedAt).valueOf()})
      }
    )
    setTimeout(()=> {
      this.props.getServerTimeMutation( {variables: {id: GraphCoolConfig.timeNodeId, lastRequestedAt: new Date(), }}).then( ({data}) =>
        {
          this.setState({offsetFromServerTime: new Date().valueOf() - new Date(data.updateTime.updatedAt).valueOf()})
        }
      )
    }, 5000)
    this.clockInterval = setInterval(()=> {
      const tickfunction = tick.bind(this)
      tickfunction(
        endOfRoundFunction = () => { 
          try {
            this.endOfRoundSoundObject.setVolumeAsync(0.85)
            this.endOfRoundSoundObject.setRateAsync(0.60, false)
            this.endOfRoundSoundObject.playAsync()
          } catch (error) {
            console.log(error)
          }
        },
        noticeSeconds = 30,
        noticeFunction = () => { 
          try {
            this.endOfRoundSoundObject.setVolumeAsync(0.50)
            this.endOfRoundSoundObject.setRateAsync(1, false)
            this.endOfRoundSoundObject.playAsync()
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
    clearInterval(this.clockInterval)
  }

  async _loadSound() {
    this.endOfRoundSoundObject = new Audio.Sound()
    try {
      await this.endOfRoundSoundObject.loadAsync(require('../assets/sounds/3beeps.aiff'))
      await this.endOfRoundSoundObject.setCallback( async (playbackStatus) => {
        if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
          await this.endOfRoundSoundObject.stopAsync()
        }        
      })
    } catch (error) {
    }
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible})
  }

  _toggleTimerButtonPressed() {
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
      this.props.getTournamentQuery.refetch()
    })
  }

  _fwdButtonPressed() {
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
      this.props.getTournamentQuery.refetch()
    })
  }

  _resetTimerButtonPressed() {
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
      this.props.getTournamentQuery.refetch()
    })
  }

  render() {
    const { getTournamentQuery: { loading, error, Tournament }, navigation } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!  {error.message}</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const chips = sortChips(Tournament.chips)
      return (
        <View style={{flex: 1, flexDirection: 'column', backgroundColor: 'green', justifyContent: 'space-around'}}>
          <KeepAwake/>
          <View style={{flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
            <Text style={[styles.titleText]}>{Tournament.title}</Text>
          </View>
          <View style={{flex: 8, flexDirection:'row', }}>
            <View style={{flex: 2, flexDirection: 'column', paddingLeft: 5}}>
              <View>
                <Text>Average Chipstack: _____</Text>
                <Text>Players Remaining: _____</Text>
                <Text>Total Chips in Play: _____</Text>
                <Text>Active Tables: _____</Text>
              </View>
              <View>
                <Text>Other Info:</Text>
                <Text>__________</Text>
              </View>
            </View>
            <View style={{flex: 4, flexDirection: 'column', }}>
              <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
                <Text
                  style={[styles.blindsText, this.state.noticeStatus && styles.blindsNoticeText]}
                >
                  {this.state.display.currentBlinds}
                </Text>
              </View>
              <View style={{flex: 3, flexDirection: 'row',  justifyContent: 'center', alignItems: 'center', }}>
                <Text 
                  style={[styles.timerText, this.state.noticeStatus && styles.timerNoticeText]}
                >
                  {this.state.display.timer}
                </Text>
              </View>
              <View style={{flex: 2, flexDirection: 'row',  justifyContent: 'center', alignItems: 'center', }}>
                <Text
                  style={[styles.nextBlindsText, this.state.noticeStatus && styles.nextBlindsNoticeText]}
                >
                  {this.state.nextSegment && (this.state.nextSegment.sBlind.toLocaleString() + '/' + this.state.nextSegment.bBlind.toLocaleString())}
                  {!this.state.nextSegment && ("No more levels scheduled.")}
                </Text>
              </View>
              <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center'}}>
                {userIsOwner && <Button buttonStyle={{backgroundColor: 'transparent'}} icon={{name: 'restore'}} onPress={this._resetTimerButtonPressed.bind(this)}></Button>}
                {userIsOwner && <Button buttonStyle={{backgroundColor: 'transparent', textAlign: 'center'}} icon={this.state.timerActive ? {name: 'pause'} : {name: 'play-arrow'}} onPress={this._toggleTimerButtonPressed.bind(this)}></Button>}
                {userIsOwner && <Button buttonStyle={{backgroundColor: 'transparent'}} icon={{name: 'fast-forward'}} onPress={this._fwdButtonPressed.bind(this)}></Button>}
              </View>
            </View>
            <View style={{flex: 2, flexDirection: 'column', paddingRight: 5}}>
              <View style={{flex: 3}}>
                <Text>Total Buy-Ins: _____</Text>
                <Text>Total Prize Pool: _____</Text>
                <Text>Players to be Paid: _____</Text>
                <Text>Players to Bubble: _____</Text>
              </View>
              <View style={{flex: 6}}>
                <Text>Payout Table</Text>
                <ScrollView>
                  <Text>1: _____</Text>
                </ScrollView>
              </View>
            </View>
          </View>


          <View style={{flex: 2, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', }}>
            {chips.map((item, i) => (
              <Avatar
                key={i}
                medium
                rounded
                title={numberToSuffixedString(item.denom)}
                titleStyle={{color: item.textColor, fontSize: 20}}
                activeOpacity={1}
                overlayContainerStyle={{backgroundColor: item.color}}
                containerStyle={{margin: 10, borderWidth: 4, borderColor: item.rimColor}}
              />
            ))
            }
          </View>
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
    flex: '1',
    fontSize: Math.min(responsiveHeight(8), responsiveWidth(8)),
    textAlign: 'center',
  },
  blindsNoticeText: {
    fontWeight: '300',
  },
  nextBlindsText: {
    color: 'rgba(150,150,150,1)',
    flex: '1',
    fontSize: Math.min(responsiveHeight(7), responsiveWidth(7)),
    textAlign: 'center',
  },
  nextBlindsNoticeText: {
    color: 'red',
  },
  timerText: {
    color: 'rgba(225,225,225,1)',
    flex: '1',
    fontFamily: 'Menlo',
    fontSize: Math.min(responsiveHeight(9), responsiveWidth(9)),
    textAlign: 'center',
  },
  timerNoticeText: {
    color: 'red',
  },
  titleText: {
    flex: '1',
    fontSize: Math.min(responsiveHeight(5), responsiveWidth(5)),
    color: '#fff',
    textAlign: 'center',
  }
})