import React, {useEffect} from 'react';
import { SafeAreaView, View, Platform, Alert, FlatList } from 'react-native';
import { Text, Button, } from '@rneui/themed'
import { responsiveFontSize, styles } from '../styles'
import { AuthContext } from '../Contexts';
import { AppLayout } from '../components/AppLayout'

export const SettingsScreen = (props) => {
  const {userName} = React.useContext(AuthContext)
  const [name, setName] = React.useState("")
  React.useEffect(()=> { 
    const fetchName = async () => {
      setName(await userName())
    }
    fetchName()
  },[])
  return (
    <AppLayout>
      <View style = {[ , {flex: 1, flexDirection: 'column', alignItems: 'center', }]}>        
        <Text style={[ , {flex: 2, textAlignVertical: 'center'}]} h3>Profile</Text>
        <Text style={[ , {flex: 2, fontSize: responsiveFontSize(2)}]}>Logged in as: {name}</Text>
        <Text style={[ , {flex: 10, fontSize: responsiveFontSize(2)}]}>Sorry...not much to see here yet.</Text>
      </View>
    </AppLayout>
  );
}