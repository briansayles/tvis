import { graphql, compose } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native'
import { getSegmentQuery, updateSegmentMutation} from '../constants/GQL'
import Events from '../api/events'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup } from '../utilities/functions'

class SegmentEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formValues: {},
    }
  }

  async componentDidMount() {
    const {sBlind, bBlind, ante, duration} = this.props.navigation.getParam('segment')
    this.setState({formValues: {sBlind, bBlind, ante, duration}})
    this.submitButtonPressedEvent = Events.subscribe("SegmentEditSubmitted", () => this.props.navigation.goBack())
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
    const {sBlind: p1, bBlind: p2, ante: p3, duration: p4} = this.props.navigation.getParam('segment')
    const {sBlind: f1, bBlind: f2, ante: f3, duration: f4} = this.state.formValues
    return p1 != f1 || p2 != f2 || p3 != f3 || p4 != f4
  }

  render() {
   	return (
      <FormView contentContainerStyle={{backgroundColor: 'white', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
        <MyInput
          title="Small Blind"
          value={(this.state.formValues.sBlind || "").toString()}
          placeholder="Enter small blind here..."
          onChangeText={(text) => this.handleInputChange('sBlind', parseInt(text))}
          keyboardType="numeric"
        />

        <MyInput
          title="Big Blind"
          value={(this.state.formValues.bBlind || "").toString()}
          placeholder="Enter big blind here..."
          onChangeText={(text) => this.handleInputChange('bBlind', parseInt(text))}
          keyboardType="numeric"
          onFocus={(currentText = '') => {
            this.setState(({formValues}) => ({formValues: {
              ...formValues,
              bBlind: this.state.formValues.bBlind || parseInt(this.state.formValues.sBlind) * 2,
            }}))
          }}
        />

        <MyInput
          title="Ante"
          value={(this.state.formValues.ante || "").toString()}
          placeholder="Enter ante here..."
          onChangeText={(text) => this.handleInputChange('ante', parseInt(text))}
          keyboardType="numeric"
        />

        <Picker
          prompt="Choose your duration"
          title="Duration (in minutes)"
          initialValue={this.state.formValues.duration || "Pick duration..."}
          selectedValue={this.state.formValues.duration}
          onValueChange={(itemValue, itemIndex) => this.handleInputChange('duration', parseInt(itemValue))}
        >
          {dictionaryLookup("DurationOptions").map((item, i) => (
            <Picker.Item key={i} label={item.longName} value={parseInt(item.shortName)}/>
          ))
          }
        </Picker>

        <SubmitButton 
          mutation={this.props.updateSegmentMutation}
          id={this.props.navigation.getParam('segment').id}
          variables={this.state.formValues}
          events={["RefreshSegmentList", "SegmentEditSubmitted"]}
          disabled={!this._isDirty()}
        />
       </FormView>
  	)
  }
}

export default compose(
  graphql(updateSegmentMutation, { name: 'updateSegmentMutation'}),
)(SegmentEditScreen)