import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, } from 'react-native-elements';
import { Form, Separator,InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getTournamentQuery, changeTitleMutation, deleteTournamentMutation, updateTournamentMutation, tournamentSubscription} from '../constants/GQL'
import { sortSegments, sortChips } from '../utilities/functions'

class TournamentEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      modalVisible: false,
      name: "",
      formData: {},
    }
  }

  static navigationOptions = {

  };

  componentDidMount() {
    // Subscribe to `UPDATED`-mutations
    this.updateTournamentSubscription = this.props.getTournamentQuery.subscribeToMore({
      document: tournamentSubscription,
      updateQuery: (previous, {subscriptionData}) => {
        this.props.getTournamentQuery.refetch()
        return
      },
      onError: (err) => {
        console.error(err)
      },
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getTournament) {
      this.setState({formData: nextProps.getTournamentQuery.Tournament})
    }
  }
  
  componentDidUpdate(prevProps) {

  }

  componentWillUnmount () {
  }

  _navigateToTimerButtonPressed(id) {
    this.props.navigation.navigate('Details', {id: id})
  }

  _closeButtonPressed() {
    this.setState({modalVisible: !this.state.modalVisible});
  }

  _submitButtonPressed() {
    this.props.updateTournamentMutation(
      {
        variables: {
          "id": this.props.getTournamentQuery.Tournament.id,
          "title": this.state.formData.title,
          "game": this.state.formData.game
        }
      }
    )
  }

  _deleteTournamentButtonPressed() {
    this.props.deleteTournamentMutation({variables: {id:this.props.getTournamentQuery.Tournament.id} }).then(
    this.props.navigation.navigate('List')
    )
  }

  handleFormChange(formData){
    this.setState({formData:formData})
    this.props.onFormChange && this.props.onFormChange(formData)
  }

  handleFormFocus(e, component){
    //console.log(e, component);
  }

  render() {
    const { getTournamentQuery: { loading, error, Tournament } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const segments = sortSegments(Tournament.segments)
      const chips = sortChips(Tournament.chips)
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
          <Button title="Timer" onPress={this._navigateToTimerButtonPressed.bind(this, Tournament.id)}></Button>
          <Form ref='tournamentForm' onFocus={this.handleFormFocus.bind(this)} onChange={this.handleFormChange.bind(this)}>
            <Separator />
            <InputField ref='title' placeholder='Tournament Title' value={Tournament.title}/>
            <PickerField ref='game' placeholder='Game Type' value={Tournament.game} options={{"":"", NLHE: "NL Holdem", PLO: "PotLO"}}/>
          </Form>
          <List>
            {
              segments.map((item, i) => (
                <ListItem
                  key={i}
                  title={item.sBlind + "/" + item.bBlind + (item.ante ? " + " + item.ante + " ante" : "" )}
                />
              ))
            }
          </List>
          <List>
            {
              chips.map((item, i) => (
                <ListItem
                  key={i}
                  titleStyle={{backgroundColor: item.color, borderWidth: 2, borderColor: item.rimColor, color: item.textColor, width: 50, textAlign: 'center', borderRadius: 1000}}
                  title={item.denom}
                />
              ))
            }
          </List>
          {userIsOwner && <Button title="DELETE THIS TOURNAMENT" onPress={this._deleteTournamentButtonPressed.bind(this)}></Button>}
          {userIsOwner && <Button title="Submit" onPress={this._submitButtonPressed.bind(this)}></Button>}
          <Text>{"\n"}</Text>
        </ScrollView>
      )
    }
  }
}

export default compose(
  graphql(getTournamentQuery, { name: 'getTournamentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(deleteTournamentMutation, { name: 'deleteTournamentMutation' }),
  graphql(updateTournamentMutation, { name: 'updateTournamentMutation'}),
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