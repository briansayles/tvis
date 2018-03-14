import React, { Component } from 'react'
import ReactNative, {
  Platform, View, TouchableOpacity, Text, StyleSheet, ActionSheetIOS, ActivityIndicator
} from 'react-native'
import { Button, Icon, Input} from 'react-native-elements'
import { dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'

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
    const { children, style, textStyle, initialValue } = this.props
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
        <TouchableOpacity
          onPress={this.onPress}
          style={[{
            alignSelf: 'stretch',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            paddingHorizontal: 6,
          }, flatStyle]}
        >
          <Text style={[{ flex: 1 }, defaultTextStyle, textStyle]}>
            {labels[values.indexOf(selectedValue || initialValue)] || initialValue}
          </Text>
          <Text style={[{color: 'black'}, defaultTextStyle, textStyle]}>▼</Text>
        </TouchableOpacity>
      )
    } else {
      return (
        <View
          style={[{
            alignSelf: 'stretch',
            paddingHorizontal: 6,
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

export class MyInput extends Component {

	constructor(props, context) {
		super(props, context)
	}

  render() {
		return (
			<View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
				<Text style={{flex: 1}}>{this.props.title}</Text>
				<Input 
					placeholder={this.props.placeholder} 
					style={{flex: 3}}
					value={this.props.value}
					onChangeText={this.props.onChangeText}
				/>
			</View>
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
        buttonStyle={{ borderRadius: 20, marginLeft: 0, marginRight: 0, marginBottom: 0, backgroundColor: '#050', alignSelf: 'center'}}
        title='Submit'
        titleStyle={{fontSize: 24, color: '#fff'}}
        onPress={this.onPress}
      />
	)
	}
}

