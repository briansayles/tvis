import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, } from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getChipQuery, deleteChipMutation, updateChipMutation} from '../constants/GQL'
import Events from '../api/events'

class ChipEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formData: {},
      refreshing: false,
      colorOptions: {
        '#f00' : 'Red',
        '#fff' : 'White',
        '#0f0' : 'Green',
        '#00f' : 'Blue',
        '#000' : 'Black',
        '#f90' : 'Orange',
        '#808' : 'Purple',
        '#888' : 'Grey',
        '#ff0' : 'Yellow',
        '#cff' : 'Light Blue',
     },
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getChipQuery && nextProps.getChipQuery.Chip) {
      this.setState({formData: nextProps.getChipQuery.Chip})
    }
  }

  handleFormChange(formData){
    this.setState({formData:formData})
  }

  handleFormFocus(e, component){
  }

  _deleteChipButtonPressed() {
    this.props.deleteChipMutation({variables: {id:this.props.getChipQuery.Chip.id} }).then(
    	() => Events.publish('RefreshChipList')).then(
    	() => alert('Nuked it!')).then(
      () => this.props.navigation.goBack()
    )
  }

  _submitButtonPressed() {
    const oldData = this.props.getChipQuery.Chip
    const newData = this.state.formData
    const variables = {
      "id": this.props.getChipQuery.Chip.id,
      "denom": parseInt(newData.denom == undefined ? oldData.denom : newData.denom),
      "color": (newData.color == undefined ? oldData.color : newData.color).toLowerCase(),
      "textColor": (newData.textColor == undefined ? oldData.textColor : newData.textColor).toLowerCase(),
      "rimColor": (newData.rimColor == undefined ? oldData.rimColor : newData.rimColor).toLowerCase(),
    }
    this.props.updateChipMutation(
      {
        variables: variables
      }
    ).then(() => Events.publish('RefreshChipList')).then(() => alert('Saved'))
  }

  _refreshButtonPressed() {
    this.props.getChipQuery.refetch()
  }

  render() {
    const { getChipQuery: { loading, error, Chip } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
    	console.log(JSON.stringify(Chip))
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
	      	<Form ref='chipForm' onFocus={this.handleFormFocus.bind(this)} onChange={this.handleFormChange.bind(this)}>
            <Separator />
 	          <InputField ref='denom' placeholder='denomination' value={(Chip.denom || 0).toString()}/>      		
 	          <PickerField ref='color' options={this.state.colorOptions} value={(Chip.color || 0).toString()}/>      		
 	          <PickerField ref='textColor' options={this.state.colorOptions} value={(Chip.textColor || 0).toString()}/>      		
 	          <PickerField ref='rimColor' options={this.state.colorOptions} value={(Chip.rimColor || 0).toString()}/>      		
	      	</Form>
          {<Button title="DELETE THIS Chip" onPress={this._deleteChipButtonPressed.bind(this)}></Button>}
          {<Button title="Submit" onPress={this._submitButtonPressed.bind(this)}></Button>}
          <Text>{"\n"}</Text>
	      </ScrollView>
    	)
    }
  }
}

export default compose(
  graphql(getChipQuery, { name: 'getChipQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(deleteChipMutation, { name: 'deleteChipMutation' }),
  graphql(updateChipMutation, { name: 'updateChipMutation'}),
)(ChipEditScreen)