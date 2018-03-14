import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'
import React from 'react'
import { ActivityIndicator, Text, View, ScrollView, ListView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, Button} from 'react-native'
import { List, ListItem, } from 'react-native-elements';
import { getChipQuery, updateChipMutation} from '../constants/GQL'
import Events from '../api/events'
import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { dictionaryLookup } from '../utilities/functions'

class ChipEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      // user: null,
      form: {},
    }
  }

  componentWillReceiveProps(nextProps) {
  }


  handleValueChange (values) {
  }

  render() {
    const { getChipQuery: { loading, error, Chip } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
     	return (
        <GiftedForm
          formName='chipEditForm' // GiftedForm instances that use the same name will also share the same states

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
          onValueChange={this.handleValueChange.bind(this)}
          defaults={{
            denomination: Chip.denomination
          }}
          validators={{
            denomination: {
              title: 'Denomination',
              validate: [{
                validator: 'matches',
                arguments: /^[\d ]*$/,
                message: '{TITLE} can contain only numeric characters'
              }]
            },
            color: {
              title: 'Chip Color',
            },
          }}
        >
          <GiftedForm.SeparatorWidget />
          
          <GiftedForm.TextInputWidget
            name='denomination'
            title='Denomination'
            clearButtonMode='while-editing'
            keyboardType='numeric'
            value={Chip.denom ? Chip.denom.toString() : ''}
          />

          <GiftedForm.ModalWidget
            title={Chip.color ? dictionaryLookup(Chip.color, "ChipColorOptions", "longName") : 'Select chip color...'}
            displayValue='color'
          >
            <GiftedForm.SeparatorWidget />
            <GiftedForm.SelectWidget name='color' multiple={false} title='Chip Color'>
              {dictionaryLookup("ChipColorOptions").map((item, i) => (
                <GiftedForm.OptionWidget key={i} title={item.longName} value={item.shortName}/>
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
                this.props.updateChipMutation(
                  {
                    variables: {
                      id: Chip.id,
                      denom: values.denomination ? parseInt(values.denomination) : undefined,
                      color: values.color ? dictionaryLookup(values.color, "ChipColorOptions") : undefined
                    }
                  }
                ).then(() => {
                  Events.publish('RefreshChipList')
                  postSubmit() // disable the loader
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
  graphql(getChipQuery, { name: 'getChipQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  // graphql(currentUserQuery, { name: 'currentUserQuery', }),
  // graphql(deleteChipMutation, { name: 'deleteChipMutation' }),
  graphql(updateChipMutation, { name: 'updateChipMutation'}),
)(ChipEditScreen)