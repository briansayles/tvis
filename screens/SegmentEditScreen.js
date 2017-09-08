import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, } from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getSegmentQuery, deleteSegmentMutation, updateSegmentMutation} from '../constants/GQL'
import Events from '../api/events'

class SegmentEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      name: "",
      formData: {},
      refreshing: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getSegmentQuery && nextProps.getSegmentQuery.Segment) {
      this.setState({formData: nextProps.getSegmentQuery.Segment})
    }
  }

  handleFormChange(formData){
    this.setState({formData:formData})
  }

  handleFormFocus(e, component){
  }

  _deleteSegmentButtonPressed() {
  	const tournamentId = this.props.getSegmentQuery.Segment.tournament.id
    this.props.deleteSegmentMutation({variables: {id:this.props.getSegmentQuery.Segment.id} }).then(
    	() => Events.publish('RefreshSegmentList')).then(
    	() => alert('Nuked it!')).then(
    	() => this.props.navigation.goBack()
    )
  }

  _submitButtonPressed() {
    const oldData = this.props.getSegmentQuery.Segment
    const newData = this.state.formData
    const variables = {
      "id": this.props.getSegmentQuery.Segment.id,
      "duration": parseInt(newData.duration == undefined ? oldData.duration : newData.duration),
      "sBlind": parseInt(newData.sBlind == undefined ? oldData.sBlind : newData.sBlind),
      "bBlind": parseInt(newData.bBlind == undefined ? oldData.bBlind : newData.bBlind),
      "ante": parseInt(newData.ante == undefined ? oldData.ante : newData.ante),
    }
    this.props.updateSegmentMutation(
      {
        variables: variables
      }
    ).then(() => Events.publish('RefreshSegmentList')).then(() => alert('Saved'))
  }

  _refreshButtonPressed() {
    this.props.getSegmentQuery.refetch()
  }

  render() {
    const { getSegmentQuery: { loading, error, Segment } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
    	console.log(JSON.stringify(Segment))
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
	      	<Form ref='segmentForm' onFocus={this.handleFormFocus.bind(this)} onChange={this.handleFormChange.bind(this)}>
            <Separator />
 	          <InputField ref='duration' label='Duration (minutes)' placeholder='duration (minutes)' value={(Segment.duration || 0).toString()}/>      		
 	          <InputField ref='sBlind' label='Small Blind' placeholder='small blind' value={(Segment.sBlind || 0).toString()}/>      		
 	          <InputField ref='bBlind' label='Big Blind' placeholder='big blind' value={(Segment.bBlind || 0).toString()}/>      		
 	          <InputField ref='ante' label='Ante' placeholder='ante' value={(Segment.ante || 0).toString()}/>      		
	      	</Form>
          {<Button title="DELETE THIS SEGMENT" onPress={this._deleteSegmentButtonPressed.bind(this)}></Button>}
          {<Button title="Submit" onPress={this._submitButtonPressed.bind(this)}></Button>}
          <Text>{"\n"}</Text>
	      </ScrollView>
    	)
    }
  }
}


export default compose(
  graphql(getSegmentQuery, { name: 'getSegmentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(deleteSegmentMutation, { name: 'deleteSegmentMutation' }),
  graphql(updateSegmentMutation, { name: 'updateSegmentMutation'}),
)(SegmentEditScreen)