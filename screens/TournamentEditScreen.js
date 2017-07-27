import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import Expo, { KeepAwake, Audio } from 'expo';
import {client} from '../main';
import {msToTime, tick} from '../utilities/functions';
import { List, ListItem, FormLabel, FormInput } from 'react-native-elements';

const currentUserQuery = gql`
  query currentUser {
      user {
          id
          name
      }
  }
`

const getTournamentQuery = gql`
  query getTournament($id: ID) {
    Tournament(id: $id)
    {
      id
      title
      updatedAt
      timer {
        id
        active
        createdAt
        updatedAt
        elapsed
      }
      segments {
        id
        duration
        sBlind
        bBlind
        ante
        game
      }
      chips {
        denom
        color
      }
      tags {
        name
      }
    }
  }
`

const changeTitle = gql`
  mutation updateTournamentTitle ($id: ID!, $newTitle: String) {
    updateTournament(id: $id, title: $newTitle) {
      id
    }
  }
`

class TournamentEditScreen extends React.Component {

  static navigationOptions = {
    title: "Tournament Details"
  };

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      name: "",
      // time: new Date(),
      // ms: 0,
      // display: "00:00",
      // segment: {sBlind: 0, bBlind: 0, duration: 0, ante: 0},
      // nextSegment: null,
      // csi: null,
      // currentDuration: 0,
      // totalDuration: 0,
      // percentage: 0,
      // noticeStatus: false,
    }
  }

  componentDidMount() {
    client.query({query: currentUserQuery}).then(
      result => {
        if (result.data.user) {
          this.setState({
            user: {
              name: result.data.user.name,
              id: result.data.user.id,
            }
          });
        }
      }
    );
    // this._loadSound()

     // Subscribe to `UPDATED`-mutations
    this.updateTournamentSubscription = this.props.getTournament.subscribeToMore({
      document: gql`
        subscription {
          Tournament(filter: {
            mutation_in: [UPDATED]
          }) {
            node {
              id
            }
          }
        }
      `,
      updateQuery: (previous, {subscriptionData}) => {
        this.props.getTournament.refetch()
        return
      },
      onError: (err) => {
        console.error(err)
      },
    });
    // this.clockInterval = setInterval(()=> {
    //   const tickfunction = tick.bind(this)
    //   tickfunction(
    //     endOfRoundFunction = () => { 
    //       try {
    //         this.endOfRoundSoundObject.setVolumeAsync(0.85)
    //         this.endOfRoundSoundObject.setRateAsync(0.25, false)
    //         this.endOfRoundSoundObject.playAsync()
    //       } catch (error) {
    //         console.log(error)
    //       }
    //     },
    //     noticeSeconds = 30,
    //     noticeFunction = () => { 
    //       try {
    //         this.endOfRoundSoundObject.setVolumeAsync(0.50)
    //         this.endOfRoundSoundObject.setRateAsync(0.5, false)
    //         this.endOfRoundSoundObject.playAsync()
    //       } catch (error) {
    //         console.log(error)
    //       }
    //     },
    //   )
    // }, 100);
  }

  componentWillUnmount () {
    // clearInterval(this.clockInterval)
  }

  async _loadSound() {
    // this.endOfRoundSoundObject = new Expo.Audio.Sound();
    // try {
    //   await this.endOfRoundSoundObject.loadAsync(require('../assets/sounds/0925.aiff'));
    //   await this.endOfRoundSoundObject.setCallback( async (playbackStatus) => {
    //     if (playbackStatus.didJustFinish && !playbackStatus.isLooping) {
    //       await this.endOfRoundSoundObject.stopAsync();
    //     }        
    //   })
    // } catch (error) {
    // }
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible});
  }

  _toggleTimerButtonPressed() {
    // const tourney = this.props.getTournament.Tournament
    // this.props.updateTournamentTimerMutation(
    //   { variables: {
    //     id: tourney.timer.id,
    //     now: new Date(), 
    //     active: !tourney.timer.active,
    //     tournamentId: tourney.id,
    //     elapsed: tourney.timer.elapsed + (tourney.timer.active ? new Date().valueOf() - new Date(tourney.timer.updatedAt).valueOf() : 0)
    //     } 
    //   }
    // )
  }

  _resetTimerButtonPressed() {
    // const tourney = this.props.getTournament.Tournament
    // this.props.updateTournamentTimerMutation(
    //   { variables: {
    //     id: tourney.timer.id,
    //     now: new Date(), 
    //     active: false,
    //     tournamentId: tourney.id,
    //     elapsed: 0
    //     } 
    //   }
    // )
  }

  _changeNameButtonPressed() {
    this.props.changeTitleMutation(
      {
        variables: {
          "id": this.props.getTournament.Tournament.id,
          "newTitle": this.state.name,
        }
      }
    )
  }

  render() {
    const { getTournament: { loading, error, Tournament } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      return (
        <View style={{flex: 1, paddingTop: 22}}>
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
          <Text style={styles.titleText}>Tournament Editor{"\n"}</Text>
          <FormLabel>Name</FormLabel>
          <FormInput onChangeText={(val) => {this.setState({'name': val})}} value={this.state.name}/>
          <Button title="Submit" onPress={this._changeNameButtonPressed.bind(this)}></Button>
          <List>
            {
              Tournament.segments.map((item, i) => (
                <ListItem
                  key={i}
                  title={item.sBlind}
                />
              ))
            }
          </List>
        </View>
      )
    }
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournament', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUser', }),
  graphql(changeTitle, { name: 'changeTitleMutation'}),
)(TournamentEditScreen)

const styles = StyleSheet.create({
  titleText: {
    fontSize: 12,
    textAlign: 'center'
  },
  blindsText: {
    fontSize: 30,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 40,
    textAlign: 'center',
  },
  blindsNoticeText: {
    fontSize: 45,
    color: 'rgba(200, 0, 0, 1)',
    lineHeight: 50,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 20,
    color: 'rgba(96,100,109,1)',
    lineHeight: 30,
    textAlign: 'center'
  }
});