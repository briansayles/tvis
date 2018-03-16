import React, { Component } from 'react'
import ReactNative, {
  Platform, View, TouchableOpacity, Text, StyleSheet, ActionSheetIOS, ActivityIndicator
} from 'react-native'
import { Button, Icon, Input} from 'react-native-elements'
import { dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

export class FormView extends Component {
	constructor(props, context) {
		super(props, context)
		this.state = {
		}
	}

	render() {
		return(
			<KeyboardAwareScrollView 
				{...this.props}>
				{this.props.children}
			</KeyboardAwareScrollView>
		)
	}
}

export class MyInput extends Component {

	constructor(props, context) {
		super(props, context)
	}

  render() {
		return (
				<Input
          {...this.props}
					value={this.props.value.toString()}
				/>
		)
	}
}


export class SubmitButton extends Component {

  constructor(props, context) {
    super(props, context)
    this.onPress = this.handlePress.bind(this)
    this.state = {
    	busy: false,
    }
  }

  handlePress() {
  	this.setState({busy: true})
  	console.log(JSON.stringify(this.props.variables))
  	this.props.mutation(
  		{
  			variables: {
  				id: this.props.id,
  				...this.props.variables
  			}
  		}
  	).then(() => {
			this.props.events.forEach(function(event) {
			  Events.publish(event)
			})
  	}).then(() => {
  		this.setState({busy: false})
  	})
  }

	render() {
		return (
	    <Button 
        icon={this.state.busy ? <ActivityIndicator/> : <Icon
          name='ios-checkmark-circle-outline'
          color='#fff'
          type='ionicon'
        />}
        iconRight
        buttonStyle={{ borderRadius: 20, marginTop: 24, marginLeft: 0, marginRight: 0, marginBottom: 0, backgroundColor: '#050', alignSelf: 'flex-end'}}
        title='Submit'
        titleStyle={{fontSize: 24, color: '#fff'}}
        onPress={this.onPress}
      />
	)
	}
}

export class Picker extends Component {
  static Item = ReactNative.Picker.Item

  constructor(props, context) {
    super(props, context)
    this.onPress = this.handlePress.bind(this)
  }

  handlePress() {
    const { children, onValueChange, prompt } = this.props
    const labels = children.map(child => child.props.label)
    const values = children.map(child => child.props.value)
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: prompt,
        options: [...labels, "Cancel"],
        cancelButtonIndex: labels.length,
      },
      index => {
        if (index < labels.length) {
          onValueChange(values[index])
        }
      }
    )
  }

  render() {
    const { children, style, textStyle, initialValue, title } = this.props
    const labels = children.map(child => child.props.label)
    const values = children.map(child => child.props.value)
    const flatStyle = (style ? StyleSheet.flatten(style) : {})

    if (Platform.OS === 'ios') {
      const { selectedValue } = this.props

      const defaultTextStyle = {
        fontSize: 18,
        lineHeight: (flatStyle.height ? flatStyle.height : 18),
      }

      return (
      	<View style={{flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, marginTop: 12}}>
	        <TouchableOpacity
	          onPress={this.onPress}
	          style={[{
	            alignSelf: 'stretch',
	            alignItems: 'center',
	            justifyContent: 'center',
	            flexDirection: 'row',
	            paddingHorizontal: 10,
	          }, flatStyle]}
	        >
	          <Text style={[{ flex: 1 }, defaultTextStyle, textStyle]}>
	            {labels[values.indexOf(selectedValue || initialValue)] || initialValue}
	          </Text>
	          <Text style={[{color: 'black'}, defaultTextStyle, textStyle]}>▼</Text>
	        </TouchableOpacity>
        </View>
      )
    } else {
      return (
        <View
          style={[{
            alignSelf: 'stretch',
            paddingHorizontal: 10,
          }, flatStyle]}
        >
          <ReactNative.Picker
            {...this.props}
            style={textStyle}
          />
        </View>
      )
    }
  }
}


