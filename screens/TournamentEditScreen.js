import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import Expo, { KeepAwake, Audio } from 'expo';
import {client} from '../main';
import {msToTime, tick} from '../utilities/functions';
import { List, ListItem, FormLabel, FormInput } from 'react-native-elements';
import { currentUserQuery, getTournamentQuery, changeTitleMutation, deleteTournamentMutation} from '../constants/GQL'

class TournamentEditScreen extends React.Component {

  static navigationOptions = {
    title: "Tournament Details"
  };

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      name: "",
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
  }

  componentWillUnmount () {
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible});
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

  _deleteTournamentButtonPressed() {
    this.props.deleteTournamentMutation({variables: {id:this.props.getTournament.Tournament.id} }).then(
    this.props.navigation.navigate('List')
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
        <ScrollView style={{flex: 1, paddingTop: 22, paddingBottom: 30}}>
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
          <Button title="DELETE THIS TOURNAMENT" onPress={this._deleteTournamentButtonPressed.bind(this)}></Button>
          <Text>{"\n"}</Text>
        </ScrollView>
      )
    }
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournament', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUser', }),
  graphql(changeTitleMutation, { name: 'changeTitleMutation'}),
  graphql(deleteTournamentMutation, { name: 'deleteTournamentMutation' }),
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