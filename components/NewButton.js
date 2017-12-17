import React from 'react';
import {Button} from 'react-native-elements'

export class NewButton extends React.Component {
  constructor(props) {
    super(props)
  }
  
  handleButtonPress() {
    alert('I was pressed')
  }

  render() {
    return (
			<Button 
				style={{flex:-1}} 
				backgroundColor="green" 
				icon={{name: 'playlist-add'}} 
				title="New"
				onPress={this.handleButtonPress}
			/>
    )
  }
}