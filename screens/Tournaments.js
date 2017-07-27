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
              <TouchableHighlight onPress={this._routeToDetailsPressed.bind(this, tournament)}>
                <Text> {i+1}: {tournament.title}    </Text>
              </TouchableHighlight>
              <TouchableHighlight onPress={this._routeToEditPressed.bind(this, tournament)}>
                <Text> edit {"\n"} </Text>
              </TouchableHighlight>
              <TouchableHighlight onPress={this._deleteButtonPressed.bind(this, tournament)}>
                <Text> delete {"\n"} </Text>
              </TouchableHighlight>
            </View>
        )})}
      </View>
    )
  }

  _routeToDetailsPressed = (tournament) => {
    this.props.routeToDetailsFunction(tournament)
  }

  _routeToEditPressed = (tournament) => {
    this.props.routeToEditFunction(tournament)
  }

  _deleteButtonPressed = (tournament) => {
    this.props.deleteTournamentFunction(tournament)
  }

}

export default Tournaments