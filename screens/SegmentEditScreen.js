import { graphql, compose } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native'
import { getSegmentQuery, updateSegmentMutation} from '../constants/GQL'
import Events from '../api/events'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup } from '../utilities/functions'

class SegmentEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      form: {},
      formValues: {},
    }
  }

  async componentDidMount() {
    const {sBlind, bBlind, ante, duration} = this.props.navigation.getParam('segment')
    this.setState({formValues: {sBlind, bBlind, ante, duration}})
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.getSegmentQuery.Segment) {
  //     this.setState({formValues: nextProps.getSegmentQuery.Segment})
  //   }
  // }

  handleInputChange (fieldName, value) {
    this.setState(({formValues}) => ({formValues: {
      ...formValues,
      [fieldName]: value,
    }}))
  }

  handleValueChange (values) {
  }

  render() {
    // const { getSegmentQuery: { loading, error, Segment } } = this.props
    // if (loading) {
    //   return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    // } else if (error) {
    //   return <Text>Error!</Text>
    // } else {  
     	return (
        <FormView contentContainerStyle={{backgroundColor: '#aaa', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>

          <MyInput
            title="Small Blind"
            value={this.state.formValues.sBlind || ""}
            placeholder="Enter small blind here..."
            onChangeText={(text) => this.handleInputChange('sBlind', parseInt(text))}
            keyboardType="numeric"
          />

          <MyInput
            title="Big Blind"
            value={this.state.formValues.bBlind || ""}
            placeholder="Enter big blind here..."
            onChangeText={(text) => this.handleInputChange('bBlind', parseInt(text))}
            keyboardType="numeric"
            onFocus={(currentText = '') => {
              this.setState(({formValues}) => ({formValues: {
                ...formValues,
                bBlind: parseInt(this.state.formValues.sBlind) * 2,
              }}))
            }}
          />

          <MyInput
            title="Ante"
            value={this.state.formValues.ante || ""}
            placeholder="Enter ante here..."
            onChangeText={(text) => this.handleInputChange('ante', parseInt(text))}
            keyboardType="numeric"
          />

          <Picker
            prompt="Choose your duration"
            title="Duration (in minutes)"
            initialValue={this.state.formValues.duration || "Pick duration..."}
            selectedValue={this.state.formValues.duration}
            onValueChange={(itemValue, itemIndex) => this.handleInputChange('duration', parseInt(itemValue))}
          >
            {dictionaryLookup("DurationOptions").map((item, i) => (
              <Picker.Item key={i} label={item.longName} value={parseInt(item.shortName)}/>
            ))
            }
          </Picker>

          <SubmitButton 
            mutation={this.props.updateSegmentMutation}
            id={this.props.navigation.getParam('segment').id}
            variables={this.state.formValues}
            events={["RefreshSegmentList", "RefreshEditor"]}
          />
         </FormView>
    	)
    // }
  }
}

export default compose(
  // graphql(getSegmentQuery, { name: 'getSegmentQuery', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
  graphql(updateSegmentMutation, { name: 'updateSegmentMutation'}),
)(SegmentEditScreen)