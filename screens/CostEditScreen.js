import { graphql, compose } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, StyleSheet, ScrollView, RefreshControl } from 'react-native'
import { getCostQuery, updateCostMutation} from '../constants/GQL'
import Events from '../api/events'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup } from '../utilities/functions'

class CostEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formValues: {},
    }
  }

  async componentDidMount() {
    const {price, chipStack, costType} = this.props.navigation.getParam('cost')
    await this.setState({formValues: {price, chipStack, costType}})
    this.submitButtonPressedEvent = Events.subscribe("CostEditSubmitted", () => this.props.navigation.goBack())
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
    const {price: p1, chipStack: p2, costType: p3} = this.props.navigation.getParam('cost')
    const {price: f1, chipStack: f2, costType: f3} = this.state.formValues
    return p1 != f1 || p2 != f2 || p3 != f3
  }

  render() {
   	return (
      <FormView contentContainerStyle={{backgroundColor: '#ccc', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
      
        <MyInput
          title="Price"
          value={(this.state.formValues.price || "").toString()}
          placeholder="Enter price here..."
          onChangeText={(text) => this.handleInputChange('price', parseInt(text))}
          keyboardType="numeric"
        />

        <MyInput
          title="Chips"
          value={(this.state.formValues.chipStack || "").toString()}
          placeholder="Enter chip value..."
          onChangeText={(text) => this.handleInputChange('chipStack', parseInt(text))}
          keyboardType="numeric"
        />

        <Picker
          prompt="Choose entry fee type"
          title="Entry Fee Type"
          initialValue={this.state.formValues.costType || "Pick entry fee type..."}
          selectedValue={this.state.formValues.costType}
          onValueChange={(itemValue, itemIndex) => this.handleInputChange('costType', itemValue)}
        >
          {dictionaryLookup("EntryFeeOptions").map((item, i) => (
            <Picker.Item key={i} label={item.longName} value={item.shortName}/>
          ))
          }
        </Picker>

        <SubmitButton 
          mutation={this.props.updateCostMutation}
          id={this.props.navigation.getParam('cost').id}
          variables={this.state.formValues}
          events={["RefreshCosttList", "RefreshEditor", "CostEditSubmitted"]}
          disabled={!this._isDirty()}
        />
      </FormView>
  	)
  }
}

export default compose(
  graphql(updateCostMutation, { name: 'updateCostMutation'}),
)(CostEditScreen)