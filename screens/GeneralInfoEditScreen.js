import {graphql, compose} from 'react-apollo'
import React from 'react'
import {Text, View, ScrollView, } from 'react-native'
import { ActivityIndicator, PricingCard, Button } from 'react-native-elements';
import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { currentUserQuery, updateTournamentMutation, getTournamentQuery} from '../constants/GQL'
import { dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import dict from '../constants/Dictionary'

class GeneralInfoEditScreen extends React.Component {

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
    this.refreshEvent = Events.subscribe('RefreshGeneralInfo', () => this._refreshButtonPressed())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getTournamentQuery) {
      this.setState({formData: nextProps.getTournamentQuery.Tournament})
    }
  }
  
  componentDidUpdate(prevProps) {

  }

  componentWillUnmount () {
    this.refreshEvent.remove()
  }

  _refreshButtonPressed() {
    this.props.getTournamentQuery.refetch()
    // alert('Editor refreshed')
  }


  _navigateToCostEdit(id) {
    this.props.navigation.navigate('CostEdit', {id: id})
  }

  handleValueChange (values) {
    // alert(values.sBlind)
    // this.setState({ form: values })    
  }

  render() {
    const { getTournamentQuery: { loading, error, Tournament } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = this.state.user && this.state.user.id === Tournament.user.id
      return (
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
            subtitle: {
              title: 'Tournament Subtitle'
            },
            comments: {
              title: 'Comments',
            },
            game: {
              title: 'Game',
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
            placeholder='Tournament title.'
          />

          <GiftedForm.TextInputWidget
            name='subtitle'
            title='Subtitle'
            clearButtonMode='while-editing'
            keyboardType='default'
            value={Tournament.subtitle ? Tournament.subtitle.toString() : ''}
            placeholder='This information will show up on the tournament list, under the tournament title. Use it for things like dates, game numbers, etc...'
          />

          <GiftedForm.TextAreaWidget
            name='comments'
            autoFocus={false}
            placeholder='Tournament information, such as location, date and time, etc... can go here.'
            value={Tournament.comments ? Tournament.comments.toString() : ''}
          />

          <GiftedForm.ModalWidget
            title='Game'
            displayValue='game'
          >
            <GiftedForm.SeparatorWidget />
            <GiftedForm.SelectWidget name='game' multiple={false} title='Game'>
              {dictionaryLookup("GameOptions").map((item, i) => (
                <GiftedForm.OptionWidget title={item.longName} value={item.shortName}/>
              ))
              }
            </GiftedForm.SelectWidget>
          </GiftedForm.ModalWidget>

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
                      subtitle: values.subtitle.toString(),
                      comments: values.comments.toString(),
                      game: values.game ? dictionaryLookup(values.game, "GameOptions") : undefined
                    }
                  }
                ).then(() => {
                  Events.publish('RefreshEditor')
                  postSubmit(); // disable the loader
                })
              }
            }}
          />
        </GiftedForm>
      )
    }
  }
}

export default compose(
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(updateTournamentMutation, { name: 'updateTournamentMutation'}),
  graphql(getTournamentQuery, { name: 'getTournamentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
)(GeneralInfoEditScreen)