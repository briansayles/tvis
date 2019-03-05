import React, { Component } from 'react'
import ReactNative, {
  Platform, View, TouchableOpacity, TouchableHighlight, StyleSheet, ActionSheetIOS, ActivityIndicator
} from 'react-native'
import { ThemeProvider, ThemeConsumer, Button, Icon, Input, Text, SearchBar} from 'react-native-elements'
import { dictionaryLookup } from '../utilities/functions'
import Events from '../api/events'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { responsiveFontSize } from '../utilities/functions'


export const theme= {
  Button: {
    titleStyle: {
      color: '#ccc',
    },
    icon: {
      color: 'blue',
      
    }
  },
  Text: {
    style: {
      color: '#777'
    }
  },
  Card: {
    containerStyle: {
      backgroundColor: '#eee',
      borderRadius: 10,
      padding: 10,
      margin: 10,
    },
  },
  ListItem: {
    wrapperStyle: {
      backgroundColor: 'blue',
    },
    topDivider: true,
    bottomDivider: true,
    chevron: true,
  },
}


export class ListHeader extends React.Component {
  constructor(props) {
    super(props)
  }
  
  _handleAddButtonPressed() {
    this.props.onAddButtonPress()
  }

  _handleSearchBoxChanged(text) {
    this.props.onSearch(text)
  }

  render() {
    return (
      <View style={{
        flex: responsiveFontSize(.006),
        paddingTop: responsiveFontSize(1), 
        paddingLeft: responsiveFontSize(2),
        paddingBottom: responsiveFontSize(1),
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: '#ddd',
      }}>
        <Text style={{fontSize: responsiveFontSize(2.5)}}>
          {this.props.title}
        </Text>
        {this.props.onSearch &&
          <SearchBar 
            containerStyle={{
              marginBottom: 1,
              paddingBottom: 10,
              backgroundColor: 'orange'
            }}
            ref={search => this.search = search}
            inputStyle={{fontSize: responsiveFontSize(1)}}
            placeholder="search..."
            lightTheme
            round
            clearIcon={{ name: "cancel" }}
            onChangeText={(text) => this._handleSearchBoxChanged(text)}
          />
        }
        {this.props.showAddButton && !this.props.loading &&
          <TouchableHighlight
            style={{marginRight: responsiveFontSize(2)}}
            onPress={()=> this._handleAddButtonPressed()} 
          >
            <Icon name='add' size={responsiveFontSize(2.5)}/>
          </TouchableHighlight>
        }
        {this.props.showAddButton && this.props.loading &&
          <View style={{marginRight: responsiveFontSize(2)}}>
            <ActivityIndicator
              color="rgba(100, 100, 100, 1)"
              size="small"        
            />
          </View>
        }
      </View>
    )
  }
}

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
					value={this.props.value.toString()}
          {...this.props}
				/>
		)
	}
}


export class SubmitButton extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
    	busy: false,
    }
  }

  handlePress() {
  	this.setState({busy: true})
  	// console.log(JSON.stringify(this.props.variables))
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
    const {mutation, events, ...props} = this.props
		return (
	    <Button 
        icon={this.state.busy ? <ActivityIndicator/> : <Icon
          name='ios-checkmark-circle-outline'
          color='#fff'
          type='ionicon'
        />}
        iconRight
        buttonStyle={{ borderRadius: 20, marginTop: 18, paddingLeft: 10, paddingRight: 12, marginLeft: 0, marginRight: 0, marginBottom: 0, backgroundColor: '#050', alignSelf: 'flex-end'}}
        disabledStyle={{backgroundColor: "#0504"}}
        title='Submit  '
        titleStyle={{fontSize: 18, color: '#fff'}}
        onPress={() => this.handlePress()}
        {...props}
      />
    )
	}
}

export class AddButton extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      busy: false,
    }
  }

  handlePress() {
    this.setState({busy: true})
    this.props.mutation(
      {
        variables: {
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
    const {mutation, ...props} = this.props
    return (
      <Button 
        icon={this.state.busy ? <ActivityIndicator/> : <Icon
          name='ios-add-circle-outline'
          color='#fff'
          type='ionicon'
        />}
        disabled={this.state.busy}
        iconRight
        buttonStyle={{ borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, marginTop: 8, backgroundColor: '#050', alignSelf: "flex-end"}}
        title='Add  '
        titleStyle={{fontSize: 14, color: '#fff'}}
        onPress={() => this.handlePress()}
        {...props}
      />
    )
  }
}

export class RemoveButton extends Component {

  constructor(props, context) {
    super(props, context)
    this.state = {
      busy: false,
    }
  }

  handlePress() {
    this.setState({busy: true})
    this.props.mutation(
      {
        variables: {
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
    const {mutation, ...props} = this.props
    return (
      <Button 
        icon={this.state.busy ? <ActivityIndicator/> : <Icon
          name='ios-remove-circle-outline'
          color='#fff'
          type='ionicon'
        />}
        disabled={this.state.busy || !this.props.variables.id}
        iconRight
        buttonStyle={{ borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, marginTop: 8, backgroundColor: '#900', alignSelf: "flex-end"}}
        title="Remove  "
        titleStyle={{fontSize: 14, color: '#fff'}}
        onPress={() => this.handlePress()}
        {...props}
      />
    )
  }
}

export class Picker extends Component {
  static Item = ReactNative.Picker.Item

  constructor(props, context) {
    super(props, context)
    // this.onPress = () => this.handlePress()
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
	          onPress={() => this.handlePress()}
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


