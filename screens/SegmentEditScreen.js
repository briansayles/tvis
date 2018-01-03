import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import {Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, Slider} from 'react-native-elements';
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
      sbSliderStep: 1,
      durationSliderStep: 1,
      sbSliderMax: 100,
      autoBB: true,
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getSegmentQuery && nextProps.getSegmentQuery.Segment) {
    	const segment = nextProps.getSegmentQuery.Segment
      this.setState({
      	formData: segment,
				sbSliderStep: segment.sBlind > 9 ? (segment.sBlind  > 74 ? 25: 5) : 1,
				durationSliderStep: segment.duration > 14 ? 5 : 1,
				sbSliderMax: segment.sBlind > 50 ? (segment.sBlind > 1000 ? 1000000 : 1000) : 100,
				autoBB: segment.bBlind == 2*segment.sBlind
      })
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
						<Text style={{marginLeft: 10, marginRight: 10}}>Duration: {this.state.formData.duration || Segment.duration} minutes </Text>
            <Slider
							minimumValue={0}
							maximumValue={60}
							step={this.state.durationSliderStep}
							animateTransitions={true}
						  value={(Segment.duration)}
						  onValueChange={(value) => {
						  	this.setState({formData: {...this.state.formData, duration: value}, durationSliderStep: value > 14 ? 5 : 1})
						  }}
						  style={{marginLeft: 10, marginRight: 10, marginBottom: 15}}
						/>
						<Text style={{marginLeft: 10, marginRight: 10, marginTop: 15}}>Small Blind: {this.state.formData.sBlind || Segment.sBlind} </Text>
						<Slider
								minimumValue={0}
								maximumValue={this.state.sbSliderMax}
								step={this.state.sbSliderStep}
						    value={(Segment.sBlind)}
						    onValueChange={(value) => {
						    	this.state.autoBB ? 
						    		this.setState({formData: {...this.state.formData, sBlind: value, bBlind: value * 2}, sbSliderStep: value > 9 ? (value > 74 ? 25: 5) : 1})
						    	:
						    		this.setState({formData: {...this.state.formData, sBlind: value}, sbSliderStep: value > 9 ? (value > 74 ? 25: 5) : 1})						    		
						    }} 
						    style={{marginLeft: 10, marginRight: 10, marginBottom: 15}}
						 />
	        	<SwitchField
	        		value={this.state.autoBB}
	        		label='Auto BB (2x SB)'
	          	ref="autoBB"
	          	onValueChange={(value) => {this.setState({autoBB: value})}}
	          />
          	<Text style={{marginLeft: 10, marginRight: 10, marginTop: 15}}>Big Blind: {this.state.formData.bBlind || Segment.bBlind} </Text>
						<Slider
								disabled={this.state.autoBB}
								minimumValue={0}
								maximumValue={this.state.sbSliderMax}
								step={this.state.sbSliderStep}
						    value={(this.state.autoBB ? this.state.formData.bBlind : Segment.bBlind)}
						    onValueChange={(value) => {
						    	this.setState({formData: {...this.state.formData, bBlind: value}, sbSliderStep: value > 9 ? (value > 74 ? 25: 5) : 1})
						    }} 
						    style={{marginLeft: 10, marginRight: 10}}
						 />
          	<Text style={{marginLeft: 10, marginRight: 10, marginTop: 15}}>Ante: {this.state.formData.ante || Segment.ante} </Text>
						<Slider
								minimumValue={0}
								maximumValue={this.state.sbSliderMax}
								step={this.state.sbSliderStep}
						    value={(Segment.ante)}
						    onValueChange={(value) => {
						    	this.setState({formData: {...this.state.formData, ante: value}})
						    }} 
						    style={{marginLeft: 10, marginRight: 10}}
						 />
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