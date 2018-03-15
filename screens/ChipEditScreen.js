import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, } from 'react-native-elements';
import { getChipQuery, updateChipMutation} from '../constants/GQL'
import Events from '../api/events'
// import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup } from '../utilities/functions'

class ChipEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formValues: {},
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.getChipQuery.Chip) {
      this.setState({formValues: nextProps.getChipQuery.Chip})
    }
  }

  handleTextInputChange (fieldName, text) {
    this.setState(({formValues}) => ({formValues: {
      ...formValues,
      [fieldName]: text,
    }}))
  }

  handleValueChange (values) {
  }

  render() {
    const { getChipQuery: { loading, error, Chip } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
     	return (
        <FormView style={{backgroundColor: '#aaa', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>

          <MyInput
            title="Denomination"
            value={this.state.formValues.denom || ""}
            placeholder="Enter denomination here..."
            onChangeText={this.handleTextInputChange.bind(this, 'denom')}
            keyboardType="numeric"
          />

          <Picker
            prompt="Choose a color"
            title="Chip color"
            initialValue={Chip.color || "Pick color..."}
            selectedValue={this.state.formValues.color}
            onValueChange={(itemValue, itemIndex) => {
              this.setState(({formValues}) => ({formValues: {
                ...formValues,
                color: itemValue,
              }}))
            }}
          >
            {dictionaryLookup("ChipColorOptions").map((item, i) => (
              <Picker.Item key={i} label={item.longName} value={item.shortName}/>
            ))
            }
          </Picker>

          <SubmitButton 
            mutation={this.props.updateChipMutation}
            id={Chip.id}
            variables={this.state.formValues}
            events={["RefreshChipList"]}
          />
        </FormView>
    	)
    }
  }
}

export default compose(
  graphql(getChipQuery, { name: 'getChipQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(updateChipMutation, { name: 'updateChipMutation'}),
)(ChipEditScreen)