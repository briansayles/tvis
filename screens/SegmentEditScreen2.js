import { graphql, compose } from 'react-apollo'
import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
// import { List, ListItem, Slider} from 'react-native-elements';
import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { currentUserQuery, getSegmentQuery, deleteSegmentMutation, updateSegmentMutation} from '../constants/GQL'
import Events from '../api/events'

class SegmentEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      user: null,
      form: {},
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
      const user = nextProps.currentUserQuery.user
      this.setState({user: user})
    }
    if (nextProps.getSegmentQuery && nextProps.getSegmentQuery.Segment) {
    	// const segment = nextProps.getSegmentQuery.Segment
    }
  }

  handleValueChange (values) {
    // alert(values.sBlind)
    // this.setState({ form: values })    
  }

  render() {
    const { getSegmentQuery: { loading, error, Segment } } = this.props
    if (loading) {
      return <Text>Loading</Text>
    } else if (error) {
      return <Text>Error!</Text>
    } else {  
     	return (
        <GiftedForm
          formName='segmentForm' // GiftedForm instances that use the same name will also share the same states
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
            sBlind: {
              title: 'Small Blind',
              validate: [{
                validator: 'matches',
                arguments: /^[\d ]*$/,
                message: '{TITLE} can contain only numeric characters'
              }]
            },
            bBlind: {
              title: 'Small Blind',
              validate: [{
                validator: 'matches',
                arguments: /^[\d ]*$/,
                message: '{TITLE} can contain only numeric characters'
              }]
            },
            ante: {
              title: 'Ante',
              validate: [{
                validator: 'matches',
                arguments: /^[\d ]*$/,
                message: '{TITLE} can contain only numeric characters'
              }]
            },
            duration: {
              title: 'Duration',
              validate: [{
                validator: 'matches',
                arguments: /^[\d ]*$/,
                message: '{TITLE} can contain only numeric characters'
              }]
            },
          }}
        >
          <GiftedForm.SeparatorWidget />
          <GiftedForm.TextInputWidget
            name='sBlind'
            title='SB'
            clearButtonMode='while-editing'
            keyboardType='numeric'
            value={Segment.sBlind ? Segment.sBlind.toString() : ''}
          />
          <GiftedForm.TextInputWidget
            name='bBlind'
            title='BB'
            clearButtonMode='while-editing'
            keyboardType='numeric'
            value={Segment.bBlind ? Segment.bBlind.toString() : ''}
          />
          <GiftedForm.TextInputWidget
            name='ante'
            title='Ante'
            clearButtonMode='while-editing'
            keyboardType='numeric'
            value={Segment.ante ? Segment.ante.toString() : ''}
          />
          <GiftedForm.TextInputWidget
            name='duration'
            title='Duration'
            clearButtonMode='while-editing'
            keyboardType='numeric'
            value={Segment.duration ? Segment.duration.toString() : ''}
          />

          <GiftedForm.ErrorsWidget/>

          <GiftedForm.SubmitWidget
            title='Submit'
            widgetStyles={{
              submitButton: {
                backgroundColor: 'green',
              }
            }}
            onSubmit={(isValid, values, validationResults, postSubmit = null, modalNavigator = null) => {
              if (isValid === true) {
                this.props.updateSegmentMutation(
                  {
                    variables: {
                      id: Segment.id,
                      sBlind: parseInt(values.sBlind),
                      bBlind: parseInt(values.bBlind),
                      ante: parseInt(values.ante),
                      duration: parseInt(values.duration),
                    }
                  }
                ).then(() => {
                  Events.publish('RefreshSegmentList')
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
  graphql(getSegmentQuery, { name: 'getSegmentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(deleteSegmentMutation, { name: 'deleteSegmentMutation' }),
  graphql(updateSegmentMutation, { name: 'updateSegmentMutation'}),
)(SegmentEditScreen)