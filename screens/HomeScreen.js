import React from 'react';
import { graphql, compose, withApollo } from 'react-apollo'
import {
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { currentUserQuery, } from '../constants/GQL'
import Auth from '../components/Auth'

class HomeScreen extends React.Component {
  
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  componentDidMount() {
    this.setState({renderedTime: new Date()})

  }

  componentWillUnmount() {
    clockInterval(clockInterval)
  }

  render() {
    const { currentUserQuery: { user } } = this.props
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={require('../assets/icons/app-icon.png')}
              style={styles.welcomeImage}
            />
          </View>
          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>
              Welcome to TourneyVision{"\n"}{"\n"}
              Poker Tournament Management{"\n"}
              made EASY.{"\n"}{"\n"}{"\n"}
              Tap 'Tournaments' to get started.
            </Text>
          </View>
          { !user && 
            <View style={{paddingTop: 20}}>
              <Auth/>
            </View>
          }
        </ScrollView>
      </View>
    )
  }
}

export default compose(
  graphql(currentUserQuery, { name: 'currentUserQuery' }),
  withApollo,
)(HomeScreen)


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    paddingTop: 80,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  welcomeImage: {
    width: 140,
    height: 38,
    resizeMode: 'contain',
    marginTop: 3,
    marginLeft: -10,
  },
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 23,
    textAlign: 'center',
  },
})
