import React from 'react';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Expo from 'expo';


export default class HomeScreen extends React.Component {
  static route = {
  };
  
  static navigationOptions = {
    title: "Home"
  };
  
  constructor(props) {
    super(props);
    this.state = {
      time: new Date(),
      renderedTime: new Date(),
    };
  }

  componentDidMount() {
    this.setState({renderedTime: new Date()});
    const clockInterval = setInterval(()=> {this.setState({time: new Date()})},250);
  }

  componentWillUnmount() {
    clockInterval(clockInterval);
  }

  render() {
    return (
      <View style={styles.container}>
        <Expo.KeepAwake />
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}>
          <View style={styles.welcomeContainer}>
            <Image
              source={require('../assets/images/expo-icon@3x.png')}
              style={styles.welcomeImage}
            />
          </View>
          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>
              This is the application's home screen!{"\n"}{"\n"}
              {this.state.time.toString()}{"\n"}{"\n"}
              {this.state.renderedTime.toString()}{"\n"}{"\n"}
              {Math.floor((this.state.time.valueOf() - this.state.renderedTime.valueOf())/60000)} Minutes{"\n"}
              {Math.floor((this.state.time.valueOf() - this.state.renderedTime.valueOf() - 60000 * Math.floor((this.state.time.valueOf() - this.state.renderedTime.valueOf())/60000))/1000)} Seconds{"\n"}
            </Text>
            <View
              style={[
                styles.codeHighlightContainer,
                styles.homeScreenFilename,
              ]}>
              <Text style={styles.codeHighlightText}>
                screens/HomeScreen.js
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }
}

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
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightText: {
    color: 'rgba(96,100,109, 0.8)',
  },
  codeHighlightContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  getStartedText: {
    fontSize: 17,
    color: 'rgba(96,100,109, 1)',
    lineHeight: 23,
    textAlign: 'center',
  },
  navigationFilename: {
    marginTop: 5,
  },
});
