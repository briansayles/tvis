import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, } from 'react-native-elements';
import { Form, Separator, InputField, LinkField, SwitchField, PickerField, DatePickerField, TimePickerField } from 'react-native-form-generator'
import { currentUserQuery, getSegmentQuery, deleteSegmentMutation, updateSegmentMutation} from '../constants/GQL'

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
    	// alert(nextProps.getSegmentQuery.Segment.id)
      this.setState({formData: nextProps.getSegmentQuery.Segment})
    }
  }

  handleFormChange(formData){
    this.setState({formData:formData})
    console.log(this.state.formData)
    // this.props.onFormChange && this.props.onFormChange(formData)
  }

  handleFormFocus(e, component){
    //console.log(e, component);
  }

  _deleteSegmentButtonPressed() {
  	const tournamentId = this.props.getSegmentQuery.Segment.tournamentId
    this.props.deleteSegmentMutation({variables: {id:this.props.getSegmentQuery.Segment.id} }).then(
    	this.props.navigation.navigate('Edit', {id: tournamentId})
    )
  }

  _submitButtonPressed() {
    // alert(this.props.getSegmentQuery.Segment.id + ": " + JSON.stringify(this.state.formData))
    const oldData = this.props.getSegmentQuery.Segment
    const newData = this.state.formData
    const variables = {
      "id": this.props.getSegmentQuery.Segment.id,
      "duration": parseInt(newData.duration ? newData.duration : oldData.duration),
      "sBlind": parseInt(newData.sBlind ? newData.sBlind : oldData.sBlind),
      "bBlind": parseInt(newData.bBlind ? newData.bBlind : oldData.bBlind),
      "ante": parseInt(newData.ante ? newData.ante : oldData.ante || 0)
    }
    // alert(JSON.stringify(variables))
    this.props.updateSegmentMutation(
      {
        variables: variables
      }
    )
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
 	          <InputField ref='duration' placeholder='duration (minutes)' value={(Segment.duration || 0).toString()}/>      		
 	          <InputField ref='sBlind' placeholder='small blind' value={(Segment.sBlind || 0).toString()}/>      		
 	          <InputField ref='bBlind' placeholder='big blind' value={(Segment.bBlind || 0).toString()}/>      		
 	          <InputField ref='ante' placeholder='ante' value={(Segment.ante || 0).toString()}/>      		
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