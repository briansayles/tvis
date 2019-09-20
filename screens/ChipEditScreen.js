import { graphql, compose } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { getChipQuery, updateChipMutation} from '../constants/GQL'
import Events from '../api/events'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup } from '../utilities/functions'

class ChipEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formValues: {},
    }
  }

  async componentDidMount() {
    const {denom, color} = this.props.navigation.getParam('chip')
    this.setState({formValues: {denom, color}})
    this.submitButtonPressedEvent = Events.subscribe("ChipEditSubmitted", () => this.props.navigation.goBack())
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
    const {denom: p1, color: p2} = this.props.navigation.getParam('chip')
    const {denom: f1, color: f2} = this.state.formValues
    return p1 != f1 || p2 != f2
  }

  render() {
   	return (
      <FormView contentContainerStyle={{backgroundColor: 'white', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
        <MyInput
          title="Denomination"
          value={(this.state.formValues.denom || 0).toString()}
          placeholder="Enter denomination here..."
          onChangeText={(text) => this.handleInputChange('denom', parseInt(text))}
          keyboardType="numeric"
        />

        <Picker
          prompt="Choose a color"
          title="Chip color"
          initialValue={this.props.navigation.getParam('chip').color || "Pick color..."}
          selectedValue={this.state.formValues.color || '#fff'}
          onValueChange={(itemValue, itemIndex) => this.handleInputChange('color', itemValue)}
        >
          {dictionaryLookup("ChipColorOptions").map((item, i) => (
            <Picker.Item key={i} label={item.longName} value={item.shortName}/>
          ))
          }
        </Picker>

        <SubmitButton 
          mutation={this.props.updateChipMutation}
          id={this.props.navigation.getParam('chip').id}
          variables={this.state.formValues}
          events={["RefreshChipList", "ChipEditSubmitted"]}
          disabled={!this._isDirty()}
        />
      </FormView>
  	)
  }
}

export default compose(
  graphql(updateChipMutation, { name: 'updateChipMutation'}),
)(ChipEditScreen)