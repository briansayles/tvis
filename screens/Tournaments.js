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
            <TouchableHighlight key={i} onPress={this._routeToDetailsPressed.bind(this, tournament)}>
              <Text> {i+1}: {tournament.title}{"\n"} </Text>
            </TouchableHighlight>
        )})}
      </View>
    )
  }

  _routeToDetailsPressed = (tournament) => {
    this.props.routeToDetailsFunction(tournament)
  }

  _deleteButtonPressed = (id) => {
    this.props.deleteTournamentFunction(id)
  }
}

export default Tournaments