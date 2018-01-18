import { graphql, compose } from 'react-apollo'
import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
// import { List, ListItem, Slider} from 'react-native-elements';
import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { currentUserQuery, getCostQuery, deleteCostMutation, updateCostMutation} from '../constants/GQL'
import Events from '../api/events'
import dict from '../constants/Dictionary'


class CostEditScreen extends React.Component {

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
    if (nextProps.getCostQuery && nextProps.getCostQuery.Cost) {
      // this.setState({formData: nextProps.getCostQuery.Cost})
    }
  }

  handleValueChange (values) {
    // alert(values.sBlind)
    // this.setState({ form: values })    
  }

  render() {
    const { getCostQuery: { loading, error, Cost } } = this.props
    if (loading) {
      return <Text>Loading</Text>
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
            title='Cost Type'
            displayValue='costType'
          >
            <GiftedForm.SeparatorWidget />
            <GiftedForm.SelectWidget name='costType' multiple={false} title='Type'>
              {dict.EntryFeeOptions.map((item, i) => (
                <GiftedForm.OptionWidget title={item.longName} value={item.shortName}/>
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
                      costType: dict.EntryFeeOptions.find((fee) => { return values.costType.toString() == fee.shortName || values.costType.toString() == fee.longName}).shortName,
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
  graphql(currentUserQuery, { name: 'currentUserQuery', }),
  graphql(updateCostMutation, { name: 'updateCostMutation'}),
)(CostEditScreen)