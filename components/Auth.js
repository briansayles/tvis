import React, { useState } from 'react'
import { ActivityIndicator, Text, View, StyleSheet, AsyncStorage } from 'react-native'
import { Button } from 'react-native-elements'
import * as AuthSession from 'expo-auth-session'
import jwtDecoder from 'jwt-decode'
import { Auth0Config } from '../config'
import {currentUserQuery, createUserMutation} from '../constants/GQL'
import { useQuery, useMutation} from '@apollo/client'

const auth0_client_id = Auth0Config.clientId
const authorize_url = Auth0Config.authorizeURI
const toQueryString = params => {
	return '?' + Object.entries(params)
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join('&')
}

export default ((props) => {
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	
	const [ createUser ] = useMutation(createUserMutation, {
		onError: (error) => {
			console.log(`createUserMutation ERROR = \n${error}`)
			setError(error.graphQLErrors[0].message)
		},
		update: (store, response) => {
			// console.log(`createUserMutation RESPONSE = \n${response}`)
		}
	})
	
	const { loading: userLoading, data: userData, error: userError, refetch, client } = useQuery(currentUserQuery)

	const loginWithAuth0 = async () => {
		setLoading(true)
    const redirectUrl = AuthSession.getRedirectUrl()
    const result = await AuthSession.startAsync({
      authUrl: authorize_url + toQueryString({
        client_id: auth0_client_id,
        response_type: 'token',
        scope: 'openid name',
        redirect_uri: redirectUrl,
      }),
    })
    if (result.type === 'success') {
      handleParams(result.params)
		}
		setLoading(false)
  }

  const handleParams = (responseObj) => {
	if (!responseObj.id_token) {return}
    if (responseObj.error) {
      Alert.alert('Error', responseObj.error_description
        || 'We\'re verry sorry, but something went wrong while logging in. It\'s probably our fault, not your\'s')
      return
    }
    const encodedToken = responseObj.id_token
    const decodedToken = jwtDecoder(encodedToken)
		const username = decodedToken.name
		AsyncStorage.setItem('token', encodedToken)
      .then(async () => {
				const onResetStoreCBUnsubscribe = client.onResetStore( async () => {
					setLoading(true)
					const { data: refetchResults } = await refetch()
					if(refetchResults && !refetchResults.user) {
						newUser = await createUser({variables: {encodedToken, username}})
					}
					setLoading(false)				
					onResetStoreCBUnsubscribe()
				})
				client.resetStore()
      })
      .catch((error) => {
        console.error('ERROR processing token.')
			})
	}

	if (loading) {
		return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
	} else {
		return (
			<View style={[{flex: 1}, styles.container]}>
				<Button
					backgroundColor='green'
					onPress={loginWithAuth0}
					title="SIGN IN or SIGN UP (FREE!)"
				/>
				{error? <Text>error.message</Text>: null}
			</View>
		)         
	}
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})	