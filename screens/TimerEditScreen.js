// import { graphql, compose } from 'react-apollo'
import React, { useState, } from 'react'
import { ActivityIndicator, Text, View, ScrollView, } from 'react-native'
import { PricingCard, Button, Icon, Input } from 'react-native-elements'
import { updateTournamentTimerMutation, getTournamentQuery, currentUserQuery } from '../constants/GQL'
import Events from '../api/events'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { useQuery, useMutation, useApollo} from '@apollo/client'

export default ((props) => {
  const [formValuesState, setFormValuesState] = useState({})
  const {data, loading: loadingData, error: errorData, client, refetch} = useQuery(getTournamentQuery, 
    {
      variables: {id: props.navigation.getParam('id')}, 
      onCompleted: (data) => {setFormValuesState({...data.Tournament.timer})}
    }
  )
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
	const [ updateTournamentTimer ] = useMutation(updateTournamentTimerMutation, {})

  const _isDirty = (timer) => {
    const {oneMinuteRemainingSpeech: p1, endOfRoundSpeech: p2} = timer
    const {oneMinuteRemainingSpeech: f1, endOfRoundSpeech: f2} = formValuesState
    return p1 != f1 || p2 != f2
  }

  if (loadingData || loadingUser) {
    return(<View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>)
  }
  if (errorData || errorUser) {
    return(<View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><Text>Error...</Text></View>)
  }
  if (data && dataUser) {
    const { Tournament: {timer}} = data

    return (
      <FormView contentContainerStyle={{backgroundColor: 'white', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
        <MyInput
          title="One Minute Remaining Speech"
          value={formValuesState.oneMinuteRemainingSpeech || ""}
          placeholder="Enter speech here for one minute remaining..."
          onChangeText={(text) => setFormValuesState({...formValuesState, 'oneMinuteRemainingSpeech': text})}
        />
        <MyInput
          title="End of Round Speech"
          value={formValuesState.endOfRoundSpeech || ""}
          placeholder="Enter speech here for the end of round..."
          onChangeText={(text) => setFormValuesState({...formValuesState, 'endOfRoundSpeech': text})}
        />
        <SubmitButton 
          mutation={updateTournamentTimer}
          // id={timer.id}
          variables={{...formValuesState}}
          // events={["RefreshEditor", "TimerEditSubmitted"]}
          disabled={!_isDirty(timer)}
        />
      </FormView>
    )    
  }
})