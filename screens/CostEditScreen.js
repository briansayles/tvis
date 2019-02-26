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
      refreshing: false,
    }
  }

  async componentDidMount() {
    const {price, chipStack, costType} = this.props.navigation.getParam('cost')
    await this.setState({formValues: {price, chipStack, costType}})
  }

  handleInputChange (fieldName, value) {
    this.setState(({formValues}) => ({formValues: {
      ...formValues,
      [fieldName]: value,
    }}))
  }

  _refresh() {
    this.props.getCostQuery.refetch()
  }



  render() {
    // const { getCostQuery: { loading, error, Cost } } = this.props
    // if (loading) {
    //   return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    // } else if (error) {
    //   return <Text>Error!</Text>
    // } else {
     	return (
        <FormView contentContainerStyle={{backgroundColor: '#ccc', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
        
          <MyInput
            title="Price"
            value={this.state.formValues.price || ""}
            placeholder="Enter price here..."
            onChangeText={(text) => this.handleInputChange('price', parseInt(text))}
            keyboardType="numeric"
          />

          <MyInput
            title="Chips"
            value={this.state.formValues.chipStack || ""}
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
            events={["RefreshCosttList", "RefreshEditor"]}
          />
        </FormView>
    	)
    // }
  }
}

export default compose(
  // graphql(getCostQuery, { name: 'getCostQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(updateCostMutation, { name: 'updateCostMutation'}),
)(CostEditScreen)