import React, { Component} from 'react';
import {Text, View, TouchableHighlight} from 'react-native';
import {graphql, compose} from 'react-apollo'
import gql from 'graphql-tag'

class Tournaments extends Component {

  render() {
    return (
      <View>
        {this.props.tournaments.map((tournament, i) => {
          return (
            <View key={i} >
              <TouchableHighlight onPress={this._navigateToDetailsPressed.bind(this, tournament)}>
                <Text> {i+1}: {tournament.title}    </Text>
              </TouchableHighlight>
              <TouchableHighlight onPress={this._navigateToEditPressed.bind(this, tournament)}>
                <Text> edit {"\n"} </Text>
              </TouchableHighlight>
            </View>
        )})}
      </View>
    )
  }

  _navigateToDetailsPressed = (tournament) => {
    this.props.navigateToDetailsFunction(tournament)
  }

  _navigateToEditPressed = (tournament) => {
    this.props.navigateToEditFunction(tournament)
  }

}

export default Tournaments