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
      // refreshing: false,
      formValues: {},
    }
  }

  static navigationOptions = {
  }

  async componentDidMount() {
    const {title, subtitle, comments, game} = this.props.navigation.getParam('tourney')
    this.setState({formValues: {title, subtitle, comments, game}})
    // this.refreshEvent = Events.subscribe('RefreshGeneralInfo', () => this._refreshButtonPressed())
  }

  // componentWillReceiveProps(nextProps) {
  //     if (nextProps.getTournamentQuery.Tournament) {
  //       this.setState({formValues: nextProps.getTournamentQuery.Tournament})
  //     }
  // }
  
  // componentDidUpdate(prevProps) {

  // }

  // componentWillUnmount () {
  //   this.refreshEvent.remove()
  // }

  // _refreshButtonPressed() {
  //   this.props.getTournamentQuery.refetch()
  // }

  // handleValueChange (values) {
  // }

  handleInputChange (fieldName, value) {
    this.setState(({formValues}) => ({formValues: {
      ...formValues,
      [fieldName]: value,
    }}))
  }

  render() {
    // const { getTournamentQuery: { loading, error, Tournament } } = this.props
    // if (loading) {
    //   return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    // } else if (error) {
    //   return <Text>Error!</Text>
    // } else {
      return (
        <FormView contentContainerStyle={{backgroundColor: '#ccc', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
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
            events={["RefreshEditor", "RefreshTournamentList"]}
          />
        </FormView>
      )
    // }
  }
}

export default compose(
  // graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(updateTournamentMutation, { name: 'updateTournamentMutation'}),
  // graphql(getTournamentQuery, { name: 'getTournamentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
)(GeneralInfoEditScreen)