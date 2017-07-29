import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import {Button} from 'react-native-elements'
import { KeepAwake, Audio } from 'expo'
import {msToTime, tick} from '../utilities/functions'
import {currentUserQuery, getTournamentQuery, changeTitleMutation, updateTournamentTimerMutation, getServerTimeMutation, tournamentSubscription} from '../constants/GQL'
import {GraphCoolConfig} from '../config'

class TournamentTimerScreen extends React.Component {

  static navigationOptions = {
    title: 'TourneyVision'
  }

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      time: new Date(),
      ms: 0,
      display: "00:00",
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
    this.updateTournamentSubscription = this.props.getTournament.subscribeToMore({
      document: tournamentSubscription,
      updateQuery: (previous, {subscriptionData}) => {
        this.props.getTournament.refetch()
        return
      },
      onError: (err) => {
        console.error(err)
      },
    })
    this.props.getServerTimeMutation().then( ({data}) =>
      {
        this.setState({offsetFromServerTime: new Date().valueOf() - new Date(data.updateTime.updatedAt).valueOf()})
      }
    )

    this.clockInterval = setInterval(()=> {
      const tickfunction = tick.bind(this)
      tickfunction(
        endOfRoundFunction = () => { 
          try {
            this.endOfRoundSoundObject.setVolumeAsync(0.85)
            this.endOfRoundSoundObject.setRateAsync(0.25, false)
            this.endOfRoundSoundObject.playAsync()
          } catch (error) {
            console.log(error)
          }
        },
        noticeSeconds = 30,
        noticeFunction = () => { 
          try {
            this.endOfRoundSoundObject.setVolumeAsync(0.50)
            this.endOfRoundSoundObject.setRateAsync(0.5, false)
            this.endOfRoundSoundObject.playAsync()
          } catch (error) {
            console.log(error)
          }
        },
      )
    }, 1)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
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
      await this.endOfRoundSoundObject.loadAsync(require('../assets/sounds/0925.aiff'))
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
    const tourney = this.props.getTournament.Tournament
    this.props.updateTournamentTimerMutation(
      { variables: {
        id: tourney.timer.id,
        now: new Date(), 
        active: !tourney.timer.active,
        tournamentId: tourney.id,
        elapsed: tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - this.state.offsetFromServerTime - new Date(tourney.timer.updatedAt).valueOf() : 0)
        } 
      }
    )
  }

  _resetTimerButtonPressed() {
    const tourney = this.props.getTournament.Tournament
    this.props.updateTournamentTimerMutation(
      { variables: {
        id: tourney.timer.id,
        now: new Date(), 
        active: false,
        tournamentId: tourney.id,
        elapsed: 0
        } 
      }
    )
  }

  _changeNameButtonPressed() {
    this.props.changeTitleMutation(
      {
        variables: {
          "id": this.props.getTournament.Tournament.id,
          "newTitle": "Tournament name updated on " + new Date().toString()
        }
      }
    )
  }

  render() {
    const { getTournament: { loading, error, Tournament }, navigation } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!  {error.message}</Text>
    } else {
      return (
        <ScrollView style={{flex: 1, paddingTop: 22}}>
          <Modal
            animationType='slide'
            transparent={false}
            visible={this.state.modalVisible}
          >
            <View style={{backgroundColor: '#060'}}>
              <Text>{"\n"}{"\n"}{"\n"}{"\n"}</Text>
              <Button title="close" onPress={this._closeButtonPressed.bind(this)}></Button>
            </View>
          </Modal>
          <KeepAwake/>
          <Text style={[styles.blindsText, this.state.noticeStatus && styles.blindsNoticeText]}>{this.state.segment.sBlind} / {this.state.segment.bBlind}</Text>
          {this.state.nextSegment && <Text style={[styles.nextBlindsText, this.state.noticeStatus && styles.nextBlindsNoticeText]}>Next: {this.state.nextSegment && this.state.nextSegment.sBlind} / {this.state.nextSegment && this.state.nextSegment.bBlind}</Text>}
          <Text style={[styles.timerText, this.state.noticeStatus && styles.timerNoticeText]}>{this.state.display}</Text>
          {this.state.user && <Button icon={this.state.timerActive ? {name: 'pause'} : {name: 'play-arrow'}} onPress={this._toggleTimerButtonPressed.bind(this)}></Button>}
          {this.state.user && <Button icon={{name: 'restore'}} onPress={this._resetTimerButtonPressed.bind(this)}></Button>}
        </ScrollView>
      )
    }
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournament', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(getServerTimeMutation, { name: 'getServerTimeMutation', options: { variables: {id: GraphCoolConfig.timeNodeId, lastRequestedAt: new Date(), } }}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(updateTournamentTimerMutation, {name: 'updateTournamentTimerMutation'}),
  graphql(changeTitleMutation, { name: 'changeTitleMutation'}),
)(TournamentTimerScreen)

const styles = StyleSheet.create({
  titleText: {
    fontSize: 16,
    textAlign: 'center',
  },
  blindsText: {
    fontSize: 50,
    color: 'rgba(96,100,109, 1)',
    textAlign: 'center',
    fontWeight: '500',
  },
  blindsNoticeText: {
    fontWeight: '300',
  },
  nextBlindsText: {
    fontSize: 26,
    lineHeight: 36,
    color: 'grey',
    textAlign: 'center',
    fontWeight: '300',
  },
  nextBlindsNoticeText: {
    color: 'red',
    fontSize: 34,
    fontWeight: '500',
  },
  timerText: {
    fontSize: 40,
    lineHeight: 50,
    color: 'rgba(96,100,109,1)',
    textAlign: 'center'
  },
  timerNoticeText: {
    fontWeight: '900',
    color: 'red'
  }
})
