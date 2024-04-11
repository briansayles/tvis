import * as React from 'react'
import { Alert } from 'react-native'
import { Audio } from 'expo-av'
import * as SecureStore from 'expo-secure-store'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as AuthSession from 'expo-auth-session'
import jwt_decode from 'jwt-decode'
import { ApolloProvider, } from '@apollo/client'
import { Ionicons } from '@expo/vector-icons'
import { makeApolloClient } from './apolloClient'
import { HomeScreen } from './screens/HomeScreen'
import { SettingsScreen} from './screens/SettingsScreen'
import { TournamentsScreen } from './screens/TournamentsScreen'
import { TournamentDashboardScreen } from './screens/TournamentDashboardScreen'
import { TournamentInfoEditScreen } from './screens/TournamentInfoEditScreen'
import { TournamentTimerScreen}  from './screens/TournamentTimerScreen'
import { SegmentEditScreen } from './screens/SegmentEditScreen'
import { ChipEditScreen } from './screens/ChipEditScreen' 
import { CostEditScreen } from './screens/CostEditScreen'
import { TimerEditScreen } from './screens/TimerEditScreen'
import { AuthContext, authReducer, authData, } from './Contexts'
import * as WebBrowser from 'expo-web-browser'
import Constants from 'expo-constants'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

WebBrowser.maybeCompleteAuthSession()
const AuthConfig = Constants.expoConfig.extra.AuthConfig
const AuthCallbackUrl = Constants.expoConfig.scheme.toString() + "://callback"

export default function App({ navigation }) {
  React.useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: 0,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: 2,
      playThroughEarpieceAndroid: true,
      staysActiveInBackground: true,
    })
  }, [])

  const [state, dispatch] = React.useReducer(
    authReducer,
    authData
  )

  React.useEffect(() => {
    bootstrapAsync = async () => {
      let userToken, refreshToken, idToken;
      try {
        userToken = await SecureStore.getItemAsync('userToken')
        const decoded = jwt_decode(userToken);
        const { exp } = decoded;
        const expiry = new Date(exp*1000)
        if (expiry < Date.now()) {
          dispatch({type: 'SIGN_OUT'})
        } else {
          refreshToken = await SecureStore.getItemAsync('refreshToken')
          idToken = await SecureStore.getItemAsync('idToken')
          dispatch({ type: 'RESTORE_TOKEN', accessToken: userToken, idToken: idToken, refreshToken: refreshToken, tokenExpiry: expiry })
        }
      } catch (e) {
      }
    };
    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async data => {
        try {
          // console.log('signIn attempt')
          const discovery = await AuthSession.fetchDiscoveryAsync(AuthConfig.discoveryURI);
          // console.log(discovery)
          const request = new AuthSession.AuthRequest({
            clientId: AuthConfig.clientId,
            redirectUri: AuthCallbackUrl,
            prompt: AuthSession.Prompt.SelectAccount,
            scopes: ["openid", "profile", "offline_access"],
            usePKCE: true,
            extraParams: {},
          });
          const result = await request.promptAsync(discovery);
          // console.log('result: ' + result)
          const code = JSON.parse(JSON.stringify(result)).params.code;
          // console.log('code: ' + code);
          const tokenRequestParams = {
            code,
            clientId: AuthConfig.clientId,
            redirectUri: AuthCallbackUrl,
            extraParams: {
              code_verifier: String(request?.codeVerifier),
            },
          };
          // console.log ('exchangeCodeAsync attempt')
          const tokenResult = await AuthSession.exchangeCodeAsync(
            tokenRequestParams,
            discovery
          );
          const accessToken = tokenResult.accessToken;
          // console.log(accessToken)  
          const jwtToken = JSON.stringify(accessToken)
          const decoded = jwt_decode(jwtToken)
          // console.log(decoded)
          const { sub, exp, id } = decoded
          const expiry = new Date(exp*1000)
          if (expiry < Date.now()) {
            Alert.alert(
              'Token expired',
              'The authentication token has expired. Please re-login.'
            )
            dispatch({type: 'SIGN_OUT'})
          }
          await SecureStore.setItemAsync('userToken', jwtToken)
          await SecureStore.setItemAsync('expiry', expiry.toString())
          await SecureStore.setItemAsync('refreshToken', tokenResult.refreshToken)
          await SecureStore.setItemAsync('idToken', tokenResult.idToken)
          dispatch({ type: 'SIGN_IN', accessToken: jwtToken, refreshToken: tokenResult.refreshToken, idToken: tokenResult.idToken, tokenExpiry: expiry });
        } catch (error) {
          console.log("Error:", error);
        }
      },
      signOut: async () => {
        await SecureStore.deleteItemAsync('userToken')
        await SecureStore.deleteItemAsync('expiry')
        dispatch({ type: 'SIGN_OUT' })
      },
      userName: async () => {
        try {
          const jwtToken = await SecureStore.getItemAsync('userToken')
          const decoded = jwt_decode(jwtToken)
          const { sub, exp } = decoded
          return sub
        } catch (e) {
          return null
        }
      },
      userId: async () => {
        try {
          const jwtToken = await SecureStore.getItemAsync('userToken')
          const decoded = jwt_decode(jwtToken)
          const {uid} = decoded
          return uid
        } catch (e) {
          return null
        } 
      }
    }),
    []
  );

  React.useEffect(()=>{
    let discovery
    let refreshTokenTimeout
    let refreshResult
    if (state.refreshToken && state.tokenExpiry > new Date()) {
      refreshTokenTimeout = setTimeout(async ()=>{
        console.log('attempting to refresh token')
        discovery = await AuthSession.fetchDiscoveryAsync(AuthConfig.discoveryURI);
        console.log(discovery)

        refreshResult = await AuthSession.refreshAsync({
          responseType: AuthSession.ResponseType.Code,
          clientId: AuthConfig.clientId,
          scopes: ["openid", "profile", "offline_access"],
          redirectUri: AuthCallbackUrl,
          refreshToken: state.refreshToken
        },discovery)

        if (refreshResult.accessToken) {
          console.log('successful refreshResult')
          const jwtToken = JSON.stringify(refreshResult.accessToken)
          const decoded = jwt_decode(jwtToken)
          const { sub, exp, id } = decoded
          const expiry = new Date(exp*1000)
          await SecureStore.setItemAsync('userToken', jwtToken)
          await SecureStore.setItemAsync('expiry', expiry.toString())
          await SecureStore.setItemAsync('refreshToken', refreshResult.refreshToken)
          dispatch({type: 'REFRESH_TOKEN', accessToken: jwtToken, tokenExpiry: expiry, refreshToken: refreshResult.refreshToken})
        } else {
          console.log(refreshResult.toString())
          console.log('refresh failed. signing out.')
          dispatch({type: 'SIGN_OUT'})
        }
      }, state.tokenExpiry.valueOf() - new Date().valueOf() - 5000)
    }
    return (() => {
      clearTimeout(refreshTokenTimeout)
    })
  }, [state])

  return (
    <AuthContext.Provider value={authContext}>
      <ApolloProvider client={makeApolloClient(state.userToken)}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName;
                if (route.name === 'Home') {
                  iconName = 'home'
                } else if (route.name === 'Profile') {
                  iconName = 'settings'
                } else if (route.name === 'Tournaments') {
                  iconName = 'list'
                } else if (route.name ==='Sign In') {
                  iconName = 'log-in-outline'
                }
                return <Ionicons name={iconName} size={size} color={color} />
              },
            })}
            tabBarOptions={{
              activeTintColor: 'tomato',
              inactiveTintColor: 'gray',
            }}
          >
            {state.userToken == null ? (
              <>
                <Tab.Screen name="Home" component={HomeScreen} />
              </>
            ) : (
              <>
                <Tab.Screen name="Home" component={HomeScreen} />
                <Tab.Screen name="Tournaments" component={TournamentsStack} />
                <Tab.Screen name="Profile" component={SettingsScreen} />
                </>
            )}
          </Tab.Navigator> 
        </NavigationContainer>
      </ApolloProvider>
    </AuthContext.Provider>
  );
}

function TournamentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Tournaments" component={TournamentsScreen} />
      <Stack.Screen name="Tournament Dashboard" component={TournamentDashboardScreen}/>
      <Stack.Screen name="Tournament Info Editor" component={TournamentInfoEditScreen}/>
      <Stack.Screen name="Timer" component={TournamentTimerScreen}/>
      <Stack.Screen name="Segment Editor" component={SegmentEditScreen}/>
      <Stack.Screen name="Chip Editor" component={ChipEditScreen}/>
      <Stack.Screen name="Entry Fee Editor" component={CostEditScreen}/>
      <Stack.Screen name="Timer Editor" component={TimerEditScreen}/>
    </Stack.Navigator>
  );
}