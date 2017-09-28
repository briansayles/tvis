import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, } from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getCostQuery, deleteCostMutation, updateCostMutation} from '../constants/GQL'
import Events from '../api/events'

class CostEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formData: {},
      refreshing: false,
      costTypeOptions: {
        Buyin: 'Standard Buyin',
        Rebuy: 'Re-Buy',
        Addon: 'Add-on',
      }
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getCostQuery && nextProps.getCostQuery.Cost) {
      this.setState({formData: nextProps.getCostQuery.Cost})
    }
  }

  handleFormChange(formData){
    this.setState({formData:formData})
  }

  handleFormFocus(e, component){
  }

  _deleteCostButtonPressed() {
    this.props.deleteCostMutation({variables: {id:this.props.getCostQuery.Cost.id} }).then(
    	() => Events.publish('RefreshCostList')).then(
    	() => alert('Nuked it!')).then(
      () => this.props.navigation.goBack()
    )
  }

  _submitButtonPressed() {
    const oldData = this.props.getCostQuery.Cost
    const newData = this.state.formData
    const variables = {
      "id": this.props.getCostQuery.Cost.id,
      "price": parseInt(newData.price == undefined ? oldData.price : newData.price),
      "chipStack": parseInt(newData.chipStack == undefined ? oldData.chipStack : newData.chipStack),
      "costType": newData.costType == undefined ? oldData.costType : newData.costType,
    }
    this.props.updateCostMutation(
      {
        variables: variables
      }
    ).then(() => Events.publish('RefreshCostList')).then(() => alert('Saved'))
  }

  _refreshButtonPressed() {
    this.props.getCostQuery.refetch()
  }

  render() {
    const { getCostQuery: { loading, error, Cost } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
    	console.log(JSON.stringify(Cost))
     	return (
	  	  <ScrollView
	  	  	style={{flex: 1, paddingTop: 22, paddingBottom: 30}}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._refreshButtonPressed.bind(this)}
            />
          }
	  	  >
	      	<Form ref='costForm' onFocus={this.handleFormFocus.bind(this)} onChange={this.handleFormChange.bind(this)}>
            <Separator />
 	          <InputField ref='price' placeholder='price' value={(Cost.price || 0).toString()}/>      		
            <InputField ref='chipStack' placeholder='chipStack' value={(Cost.chipStack || 0).toString()}/>         
 	          <PickerField ref='costType' options={this.state.costTypeOptions} value={Cost.costType}/>      		
	      	</Form>
          {<Button title="DELETE THIS COST" onPress={this._deleteCostButtonPressed.bind(this)}></Button>}
          {<Button title="Submit" onPress={this._submitButtonPressed.bind(this)}></Button>}
          <Text>{"\n"}</Text>
	      </ScrollView>
    	)
    }
  }
}

export default compose(
  graphql(getCostQuery, { name: 'getCostQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(deleteCostMutation, { name: 'deleteCostMutation' }),
  graphql(updateCostMutation, { name: 'updateCostMutation'}),
)(CostEditScreen)