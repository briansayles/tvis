import { graphql, compose } from 'react-apollo'
import React from 'react'
import {Text, View, ScrollView, } from 'react-native'
import { ActivityIndicator, PricingCard, Button, Icon, Input } from 'react-native-elements'
import { updateTournamentTimerMutation,  } from '../constants/GQL'
import { dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'

class TimerEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      // refreshing: false,
      formValues: {},
    }
  }

  static navigationOptions = {
  }

  async componentDidMount() {
    const {oneMinuteRemainingSpeech, playOneMinuteRemainingSound, endOfRoundSpeech, playEndOfRoundSound, backgroundColor} = this.props.navigation.getParam('timer')
    this.setState({formValues: {oneMinuteRemainingSpeech, playOneMinuteRemainingSound, endOfRoundSpeech, playEndOfRoundSound, backgroundColor}})
  }

  handleInputChange (fieldName, value) {
    this.setState(({formValues}) => ({formValues: {
      ...formValues,
      [fieldName]: value,
    }}))
  }

  render() {
      return (
        <FormView contentContainerStyle={{backgroundColor: '#ccc', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
          <MyInput
            title="One Minute Remaining Speech"
            value={this.state.formValues.oneMinuteRemainingSpeech || ""}
            placeholder="Enter speech here for one minute remaining..."
            onChangeText={(text) => this.handleInputChange('oneMinuteRemainingSpeech', text)}
          />
          
          <MyInput
            title="End of Round Speech"
            value={this.state.formValues.endOfRoundSpeech || ""}
            placeholder="Enter speech here for the end of round..."
            onChangeText={(text) => this.handleInputChange('endOfRoundSpeech', text)}
          />

          <SubmitButton 
            mutation={this.props.updateTournamentTimerMutation}
            id={this.props.navigation.getParam('timer').id}
            variables={this.state.formValues}
            events={["RefreshEditor"]}
          />
        </FormView>
      )
    // }
  }
}

export default compose(
  graphql(updateTournamentTimerMutation, { name: 'updateTournamentTimerMutation'}),
)(TimerEditScreen)
