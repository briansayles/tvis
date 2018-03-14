import { graphql, compose } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native'
import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { getSegmentQuery, updateSegmentMutation} from '../constants/GQL'
import Events from '../api/events'

class SegmentEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      form: {},
    }
  }

  componentWillReceiveProps(nextProps) {
  }

  handleValueChange (values) {
  }

  render() {
    const { getSegmentQuery: { loading, error, Segment } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
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
          clearOnClose={true} // delete the values of the form when unmounted
          defaults={{
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
              title: 'Big Blind',
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
            onTextInputFocus={(currentText = '') => {
              return (parseInt(GiftedFormManager.getValue('segmentForm', 'sBlind')) * 2 || 0).toString()
            }}
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
  // graphql(currentUserQuery, { name: 'currentUserQuery', }),
  // graphql(deleteSegmentMutation, { name: 'deleteSegmentMutation' }),
  graphql(updateSegmentMutation, { name: 'updateSegmentMutation'}),
)(SegmentEditScreen)