import React from 'react'
import { ActivityIndicator, StyleSheet, Text, View, Button, AsyncStorage} from 'react-native'
import { useQuery, } from '@apollo/client'

import Auth from '../components/Auth'
import {currentUserQuery} from '../constants/GQL'

export default ((props) => {
  const {data, loading, error, refetch, client} = useQuery(currentUserQuery)

	const logout = async () => {
    await AsyncStorage.removeItem('token')
		client.resetStore()
	}

  return(
    <View style={styles.container}>
      { loading? <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
        : error? <Text>`Error! ${error.message}`</Text>
          : !data.user? <Auth/>
            : <View style={styles.container}>
                <Text>Logged in as { data.user.name }</Text>
                <Text>You have { data.user.credits ? data.user.credits.toString() : '0' } credits.</Text>
                <Button onPress={logout} title={`Logout ${data.user.name}`}/>
              </View>
      }
    </View>
  )
})
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})