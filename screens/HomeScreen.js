import React, { useState, useEffect } from 'react';
import {
    ActivityIndicator,
		Alert,
		AsyncStorage,
    Button,
    Image,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
  } from 'react-native';
import {useQuery, } from '@apollo/client'
import { currentUserQuery, } from '../constants/GQL'
import Auth from '../components/Auth'



export default ((props) => {
	const { loading, data, error, refetch, client } = useQuery(currentUserQuery);
	const logout = async () => {
		await AsyncStorage.removeItem('token')
		client.resetStore()
	}

  return (
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
      { loading? <ActivityIndicator/>
        : error? <Text>ERROR!</Text>
          : !data.user? <View style={{paddingTop: 20}}><Auth/></View>
            : <Button onPress={logout} title={`Logout ${data.user.name}`}/>
      }
	  </ScrollView>
  );
})

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
