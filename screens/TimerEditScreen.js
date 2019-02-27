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
      formValues: {},
    }
  }

  async componentDidMount() {
    const {oneMinuteRemainingSpeech, playOneMinuteRemainingSound, endOfRoundSpeech, playEndOfRoundSound, backgroundColor} = this.props.navigation.getParam('timer')
    this.setState({formValues: {oneMinuteRemainingSpeech, playOneMinuteRemainingSound, endOfRoundSpeech, playEndOfRoundSound, backgroundColor}})
    this.submitButtonPressedEvent = Events.subscribe("TimerEditSubmitted", () => this.props.navigation.goBack())
  }

  componentWillUnmount () {
    this.submitButtonPressedEvent.remove()
  }

  handleInputChange (fieldName, value) {
    this.setState(({formValues}) => ({formValues: {
      ...formValues,
      [fieldName]: value,
    }}))
  }

  _isDirty() {
    const {oneMinuteRemainingSpeech: p1, endOfRoundSpeech: p2} = this.props.navigation.getParam('timer')
    const {oneMinuteRemainingSpeech: f1, endOfRoundSpeech: f2} = this.state.formValues
    return p1 != f1 || p2 != f2
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
          events={["RefreshEditor", "TimerEditSubmitted"]}
          disabled={!this._isDirty()}
        />
      </FormView>
    )
  }
}

export default compose(
  graphql(updateTournamentTimerMutation, { name: 'updateTournamentTimerMutation'}),
)(TimerEditScreen)
