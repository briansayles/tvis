import { graphql, compose } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native'
import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { getCostQuery, updateCostMutation} from '../constants/GQL'
import Events from '../api/events'
import { dictionaryLookup } from '../utilities/functions'


class CostEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      // user: null,
      form: {},
    }
  }

  componentWillReceiveProps(nextProps) {
    // if (nextProps.currentUserQuery.user && nextProps.currentUserQuery.user !== this.props.currentUserQuery.user) {
    //   const user = nextProps.currentUserQuery.user
    //   this.setState({user: user})
    // }
    // if (nextProps.getCostQuery && nextProps.getCostQuery.Cost) {
    //   // this.setState({formData: nextProps.getCostQuery.Cost})
    // }
  }

  // handleValueChange (values) {
    // alert(values.sBlind)
    // this.setState({ form: values })    
  // }

  render() {
    const { getCostQuery: { loading, error, Cost } } = this.props
    if (loading) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error) {
      return <Text>Error!</Text>
    } else {
     	return (

        <GiftedForm
          formName='costForm' // GiftedForm instances that use the same name will also share the same states

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
            price: {
              title: 'Price',
              validate: [{
                validator: 'matches',
                arguments: /^[\d ]*$/,
                message: '{TITLE} can contain only numeric characters'
              }]
            },
            chipStack: {
              title: 'Chips',
              validate: [{
                validator: 'matches',
                arguments: /^[\d ]*$/,
                message: '{TITLE} can contain only numeric characters'
              }]
            },
            costType: {
              title: 'Type'
            },
          }}
        >
          <GiftedForm.SeparatorWidget />
          <GiftedForm.TextInputWidget
            name='price'
            title='Price'
            clearButtonMode='while-editing'
            keyboardType='numeric'
            value={Cost.price ? Cost.price.toString() : ''}
          />
          <GiftedForm.TextInputWidget
            name='chipStack'
            title='Chips'
            clearButtonMode='while-editing'
            keyboardType='numeric'
            value={Cost.chipStack ? Cost.chipStack.toString() : ''}
          />
          <GiftedForm.ModalWidget
            title={Cost.costType ? dictionaryLookup(Cost.costType, "EntryFeeOptions", "longName") : 'Select entry fee type...'}
            displayValue='costType'
          >
            <GiftedForm.SeparatorWidget />
            <GiftedForm.SelectWidget name='costType' multiple={false} title='Type'>
              {dictionaryLookup("EntryFeeOptions").map((item, i) => (
                <GiftedForm.OptionWidget key={i} title={item.longName} value={item.shortName}/>
              ))
              }
            </GiftedForm.SelectWidget>
          </GiftedForm.ModalWidget>

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
                this.props.updateCostMutation(
                  {
                    variables: {
                      id: Cost.id,
                      price: parseInt(values.price),
                      chipStack: parseInt(values.chipStack),
                      costType: values.costType ? dictionaryLookup(values.costType.toString(), "EntryFeeOptions") : undefined,
                    }
                  }
                ).then(() => {
                  Events.publish('RefreshCostList')
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
  graphql(getCostQuery, { name: 'getCostQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  // graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(updateCostMutation, { name: 'updateCostMutation'}),
)(CostEditScreen)