import {graphql, compose} from 'react-apollo'
import React from 'react'
import {Text, View, ScrollView, } from 'react-native'
import { PricingCard, Button } from 'react-native-elements';
import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { currentUserQuery, getTournamentCostsQuery, createTournamentCostMutation, updateTournamentMutation, } from '../constants/GQL'
import { sortSegments, sortChips } from '../utilities/functions'
import Events from '../api/events'
import dict from '../constants/Dictionary'

class CostListScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      refreshing: false,
      form: {},
    }
  }

  static navigationOptions = {
  };

  componentDidMount() {
    this.refreshEvent = Events.subscribe('RefreshCostList', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getTournamentCostsQuery) {
      this.setState({formData: nextProps.getTournamentCostsQuery})
    }
  }
  
  componentDidUpdate(prevProps) {

  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refreshButtonPressed() {
    this.props.getTournamentCostsQuery.refetch()
    // alert('Editor refreshed')
  }

  _addButtonPressed() {
    this.props.createTournamentCostMutation(
      {
        variables:
        {
          "tournamentId": this.props.getTournamentCostsQuery.Tournament.id,
          "price": 20,
          "chipStack": 1000,
        }
      }
    ).then(() => this._refreshButtonPressed()).then(() => alert('Cost added'))
  }

  _navigateToCostEdit(id) {
    this.props.navigation.navigate('CostEdit', {id: id})
  }

  handleValueChange (values) {
    // alert(values.sBlind)
    // this.setState({ form: values })    
  }

  render() {
    const { getTournamentCostsQuery: { loading, error, Tournament } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      const costs = Tournament.costs
      return (
        <View style={{flex: 1, flexDirection: 'column'}}>
          <GiftedForm
            formName='basicInfoForm' // GiftedForm instances that use the same name will also share the same states

            openModal = {
              (router) => {
                this.props.navigation.navigate('Modal',
                  { renderContent: router.renderScene,
                    onClose: router.onClose,
                    getTitle: router.getTitle
                  });
              }
            }
            // openModal={(route) => {
            //   this.props.navigation.navigate(route); // The ModalWidget will be opened using this method. Tested with ExNavigator
            // }}
            clearOnClose={true} // delete the values of the form when unmounted
            onValueChange={this.handleValueChange.bind(this)}
            defaults={{
              /*
              username: 'Farid',
              'gender{M}': true,
              password: 'abcdefg',
              country: 'FR',
              birthday: new Date(((new Date()).getFullYear() - 18)+''),
              */
            }}
            validators={{
              title: {
                title: 'Tournament Title',
              },
            }}
          >
            <GiftedForm.SeparatorWidget />
            
            <GiftedForm.TextInputWidget
              name='title'
              title='Tournament Title'
              clearButtonMode='while-editing'
              keyboardType='default'
              value={Tournament.title ? Tournament.title.toString() : ''}
            />

            <GiftedForm.TextAreaWidget
              name='comments'
              autoFocus={false}
              placeholder='Tournament information, such as location, date and time, etc... can go here.'
              value={Tournament.comments ? Tournament.comments.toString() : ''}
            />

            <GiftedForm.SubmitWidget
              title='Submit'
              widgetStyles={{
                submitButton: {
                  backgroundColor: 'green',
                }
              }}
              onSubmit={(isValid, values, validationResults, postSubmit = null, modalNavigator = null) => {
                if (isValid === true) {
                  this.props.updateTournamentMutation(
                    {
                      variables: {
                        id: Tournament.id,
                        title: values.title.toString(),
                        comments: values.comments.toString(),
                      }
                    }
                  ).then(() => {
                    Events.publish('RefreshTournamentList')
                    postSubmit(); // disable the loader
                  })
                }
              }}
            />

          </GiftedForm>
          <View style={{flexDirection: 'column', flex: 5}}>
            <Text style={{flex: 0.1, marginLeft: 10, marginRight: 10, marginBottom: 20, textAlign: 'center'}}>
              Tap on a cost to modify it.
            </Text>
            <ScrollView style={{flexDirection: 'column', flex: 1, alignItems: 'center'}}
            >          
              {costs && costs.map((item, i) => (
                <PricingCard
                  key={i}
                  color='#4f9deb'
                  title={item.costType}
                  price={item.price.toLocaleString({style: 'currency', currency: 'USD', currencyDisplay: 'symbol'})}
                  info={[item.chipStack.toLocaleString() + ' Chips']}
                  button={{ title: 'Edit', icon: 'flight-takeoff' }}
                  onButtonPress={this._navigateToCostEdit.bind(this, item.id)}
                >             
                </PricingCard>
              ))
              }
            {this.state.user && <Button style={{flex:-1}} onPress={this._addButtonPressed.bind(this)} icon={{name: 'playlist-add'}} title="Add"></Button>}
            </ScrollView>
          </View>

        </View>
      )
    }
  }
}

export default compose(
  graphql(getTournamentCostsQuery, { name: 'getTournamentCostsQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(createTournamentCostMutation, {name: 'createTournamentCostMutation'}),
  graphql(updateTournamentMutation, { name: 'updateTournamentMutation'}),
)(CostListScreen)