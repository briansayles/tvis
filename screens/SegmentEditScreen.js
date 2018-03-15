import { graphql, compose } from 'react-apollo'
import React from 'react'
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native'
import { GiftedForm, GiftedFormManager } from 'react-native-gifted-form'
import { getSegmentQuery, updateSegmentMutation} from '../constants/GQL'
import Events from '../api/events'
import { Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup } from '../utilities/functions'

class SegmentEditScreen extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      form: {},
      formValues: {},
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.getSegmentQuery.Segment) {
      this.setState({formValues: nextProps.getSegmentQuery.Segment})
    }
  }

  handleTextInputChange (fieldName, text) {
    this.setState(({formValues}) => ({formValues: {
      ...formValues,
      [fieldName]: parseInt(text) || text,
    }}))
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
        <View style={{flex: 1, paddingLeft: 5, paddingRight: 5, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center'}}>

          <MyInput
            title="Small Blind"
            value={this.state.formValues.sBlind || ""}
            placeholder="Enter small blind here..."
            onChangeText={this.handleTextInputChange.bind(this, 'sBlind')}
          />

          <MyInput
            title="Big Blind"
            value={this.state.formValues.bBlind || ""}
            placeholder="Enter big blind here..."
            onChangeText={this.handleTextInputChange.bind(this, 'bBlind')}
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
            onChangeText={this.handleTextInputChange.bind(this, 'ante')}
          />

          <Picker
            prompt="Choose your duration"
            initialValue={Segment.duration || "Pick duration..."}
            selectedValue={this.state.formValues.duration}
            onValueChange={(itemValue, itemIndex) => {
              this.setState(({formValues}) => ({formValues: {
                ...formValues,
                duration: itemValue,
              }}))
            }}
          >
            {dictionaryLookup("DurationOptions").map((item, i) => (
              <Picker.Item key={i} label={item.longName} value={parseInt(item.shortName)}/>
            ))
            }
          </Picker>

          <SubmitButton 
            mutation={this.props.updateSegmentMutation}
            id={Segment.id}
            variables={this.state.formValues}
            events={["RefreshSegmentList", "RefreshEditor"]}
          />






         </View>
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