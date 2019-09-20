import { graphql, compose } from 'react-apollo'
import React from 'react'
import {Text, View, ScrollView, } from 'react-native'
import { ActivityIndicator, PricingCard, Button, Icon, Input } from 'react-native-elements'
import { currentUserQuery, updateTournamentMutation, getTournamentQuery } from '../constants/GQL'
import { dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'

class GeneralInfoEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      formValues: {},
    }
  }

  static navigationOptions = {
  }

  async componentDidMount() {
    const {title, subtitle, comments, game} = this.props.navigation.getParam('tourney')
    this.setState({formValues: {title, subtitle, comments, game}})
    this.submitButtonPressedEvent = Events.subscribe("GeneralInfoSubmitted", () => this.props.navigation.goBack())
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
    const {title: p1, subtitle: p2, comments: p3, game: p4} = this.props.navigation.getParam('tourney')
    const {title: f1, subtitle: f2, comments: f3, game: f4} = this.state.formValues
    return p1 != f1 || p2 != f2 || p3 != f3 || p4 != f4
  }

  render() {
    return (
      <FormView contentContainerStyle={{backgroundColor: 'white', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
        <MyInput
          title="Title"
          value={this.state.formValues.title || ""}
          placeholder="Enter title here..."
          onChangeText={(text) => this.handleInputChange('title', text)}
        />
        
        <MyInput
          title="Subtitle"
          value={this.state.formValues.subtitle || ""}
          placeholder="Enter subtitle here..."
          onChangeText={(text) => this.handleInputChange('subtitle', text)}
        />

        <MyInput
          style={{height: 100}}
          title="Comments"
          value={this.state.formValues.comments || ""}
          placeholder="Enter comments here..."
          onChangeText={(text) => this.handleInputChange('comments', text)}
          multiline = {true}
          numberOfLines = {6}
        />

        <Picker
          prompt="Choose your game"
          title="Game"
          initialValue={this.state.formValues.game || "Pick game..."}
          selectedValue={this.state.formValues.game}
          onValueChange={(itemValue, itemIndex) => this.handleInputChange('game', itemValue)}
        >
          {dictionaryLookup("GameOptions").map((item, i) => (
            <Picker.Item key={i} label={item.longName} value={item.shortName}/>
          ))
          }
        </Picker>
        <SubmitButton 
          mutation={this.props.updateTournamentMutation}
          id={this.props.navigation.getParam('tourney').id}
          variables={this.state.formValues}
          events={["RefreshEditor", "RefreshTournamentList", "GeneralInfoSubmitted"]}
          disabled={!this._isDirty()}
        />
      </FormView>
    )
  }
}

export default compose(
  graphql(updateTournamentMutation, { name: 'updateTournamentMutation'}),
)(GeneralInfoEditScreen)