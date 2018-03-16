import { graphql, compose } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native'
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.getCostQuery.Cost) {
      this.setState({formValues: nextProps.getCostQuery.Cost})
    }
  }

  handleTextInputChange (fieldName, text) {
    this.setState(({formValues}) => ({formValues: {
      ...formValues,
      [fieldName]: parseInt(text) || text,
    }}))
  }

  render() {
    const { getCostQuery: { loading, error, Cost } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
     	return (
        <FormView style={{backgroundColor: '#ccc', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
        
          <MyInput
            title="Price"
            value={this.state.formValues.price || ""}
            placeholder="Enter price here..."
            onChangeText={this.handleTextInputChange.bind(this, 'price')}
          />

          <MyInput
            title="Chips"
            value={this.state.formValues.chipStack || ""}
            placeholder="Enter chip value..."
            onChangeText={this.handleTextInputChange.bind(this, 'chipStack')}
          />

          <Picker
            prompt="Choose entry fee type"
            title="Entry Fee Type"
            initialValue={Cost.costType || "Pick entry fee type..."}
            selectedValue={this.state.formValues.costType}
            onValueChange={(itemValue, itemIndex) => {
              this.setState(({formValues}) => ({formValues: {
                ...formValues,
                costType: itemValue,
              }}))
            }}
          >
            {dictionaryLookup("EntryFeeOptions").map((item, i) => (
              <Picker.Item key={i} label={item.longName} value={item.shortName}/>
            ))
            }
          </Picker>

          <SubmitButton 
            mutation={this.props.updateCostMutation}
            id={Cost.id}
            variables={this.state.formValues}
            events={["RefreshCostList"]}
          />

        </FormView>

    	)
    }
  }
}

export default compose(
  graphql(getCostQuery, { name: 'getCostQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(updateCostMutation, { name: 'updateCostMutation'}),
)(CostEditScreen)