import { graphql, compose } from 'react-apollo'
import React from 'react'
import {Text, View, ScrollView, } from 'react-native'
import { ActivityIndicator, PricingCard, Button, Icon, Input } from 'react-native-elements'
// import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { currentUserQuery, updateTournamentMutation, getTournamentQuery } from '../constants/GQL'
import { dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import Picker from '../components/Picker'

class GeneralInfoEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      form: {},
      language: '',
      input1: '',
    }
  }

  static navigationOptions = {
  }

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshGeneralInfo', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
  }
  
  componentDidUpdate(prevProps) {

  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refreshButtonPressed() {
    this.props.getTournamentQuery.refetch()
  }


  _navigateToCostEdit(id) {
    this.props.navigation.navigate('CostEdit', {id: id})
  }

  handleValueChange (values) {
  }

  render() {
    const { getTournamentQuery: { loading, error, Tournament } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      return (
        <View style={{flex: 1, paddingLeft: 5, paddingRight: 5, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
          <Input placeholder="place holder" onChangeText={(text) => this.setState({input1: text})}/>
          <Picker
            prompt="Choose your game"
            initialValue={Tournament.game || "Pick game..."}
            selectedValue={this.state.language}
            onValueChange={(itemValue, itemIndex) => {
              this.setState({language: itemValue})
            }}
          >
            {dictionaryLookup("GameOptions").map((item, i) => (
              <Picker.Item key={i} label={item.longName} value={item.shortName}/>
            ))
            }
          </Picker>
          <Text>{this.state.language}</Text>
          <Text>{this.state.input1}</Text>
          <Button 
            icon={<Icon
              name='ios-checkmark-circle-outline'
              color='green'
              type='ionicon'
            />}
            iconRight
            buttonStyle={{ borderRadius: 20, marginLeft: 0, marginRight: 0, marginBottom: 0, backgroundColor: '#008', alignSelf: 'center'}}
            title='Submit'
            titleStyle={{fontSize: 24, color: '#fff'}}
            onPress={()=> {
              alert(this.state.language + "  " + this.state.input1)
            }}
          />
        </View>
      )
    }
  }
}

export default compose(
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(updateTournamentMutation, { name: 'updateTournamentMutation'}),
  graphql(getTournamentQuery, { name: 'getTournamentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
)(GeneralInfoEditScreen)