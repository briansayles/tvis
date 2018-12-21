import React from 'react';
import { ActivityIndicator, Text, View, StyleSheet, TouchableHighlight, } from 'react-native'
import { Button, SearchBar, Icon } from 'react-native-elements'
import { responsiveFontSize } from '../utilities/functions'

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