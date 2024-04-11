import { useMutation, useQuery, gql,  } from '@apollo/client'
import React, { useState, useEffect} from 'react'
import { ActivityIndicator, View, Platform, useWindowDimensions } from 'react-native'
import { Text, Button, CheckBox} from '@rneui/themed'
import { SubmitButton, MyInput, } from '../components/FormComponents'
import { ErrorMessage } from '../components/ErrorMessage'
import { responsiveFontSize } from '../utilities/functions'
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { AppLayout } from '../components/AppLayout'

export const TimerEditScreen = (props) => {
  const { height, width } = useWindowDimensions()
  const orientation = height > width ? 'portrait' : 'landscape'
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const {data, loading, error} = useQuery(GET_TIMER_QUERY, {variables: {id: props.route.params.id}})
  const [updateTimer] = useMutation(UPDATE_TIMER_MUTATION, {
    variables: {
      ...formValues,
    },
  })

  useEffect(()=>{
    if (data) {
      setInitialValues(data.timers_by_pk)
      setFormValues(data.timers_by_pk)
    }
  },[data])

  const [ playingSound, setPlayingSound] = useState(false)
  const playSoundEffect = async (customSpeech="", beepRate, playBeeps, volume) => {
    try {
      const { sound: soundObject, status }  = await Audio.Sound.createAsync(
        require('../assets/sounds/0925.mp3'),
        {
          positionMillis: 0,
          volume,
          rate: beepRate,
          shouldPlay: playBeeps,
          shouldCorrectPitch: false,
        },
        (playbackStatus) => {
          if (playbackStatus.didJustFinish) {
            Speech.speak(
              customSpeech,
              {
                rate: 0.9,
                pitch: Platform.OS === "ios" ? 1.30 : 1.00,
                onDone: async () => {
                  setPlayingSound(false)              
                }
              }
            )
          }
        }
      )
    } catch (error) {
      console.log(error)
      setPlayingSound(false)
    }
  }

  const soundCheckOneMinuteWarning = () => {
    if (!playingSound) {
      setPlayingSound(true)
      playSoundEffect((formValues.oneMinuteRemainingSpeech || ""), 1.5, true, 1)
    }
  }

  const soundCheckEndOfRound = () => {
    if (!playingSound) {
      setPlayingSound(true)
      const speech = (formValues.endOfRoundSpeech ? formValues.endOfRoundSpeech + ". ":"") + "The blinds are now five hundred and one thousand with an ante of one hundred."
      playSoundEffect(speech, 1, true, 1)
    }
  }

  const handleInputChange = (fieldName, value) => {
    setFormValues({...formValues, [fieldName]:value})
  }

  const isDirty = () => {
    let result = false
    Object.keys(formValues).forEach((key, index) => { if (formValues[key] !== initialValues[key]) result = true })
    return result
  }

  if (loading) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (data && formValues !== null && initialValues !== null) {
    return (
      <AppLayout>
        <View style={{flex: 9, flexDirection: 'column', justifyContent: 'flex-start'}}>
          <CheckBox
            title="Play sound and speech one minute before the end of each round"
            checked={formValues.playOneMinuteRemainingSound}
            onPress={()=> {handleInputChange('playOneMinuteRemainingSound', !formValues.playOneMinuteRemainingSound)}}
            containerStyle={{backgroundColor: 'transparent'}}
          />
          <MyInput
            title="One minute remaining speech (optional)"
            value={(formValues?.oneMinuteRemainingSpeech ? formValues.oneMinuteRemainingSpeech : "")}
            placeholder="Enter one minute remaining speech here..."
            onChangeText={(text) => handleInputChange('oneMinuteRemainingSpeech', text)}
            keyboardType="default"
            multiline={true}
            disabled={!formValues?.playOneMinuteRemainingSound}
          />
          <Button disabled={!formValues.playOneMinuteRemainingSound || playingSound} buttonStyle={[ , {marginHorizontal: responsiveFontSize(10), }]} titleStyle={[ , {fontSize: responsiveFontSize(1.5)}]} onPress={()=> soundCheckOneMinuteWarning()}>Test 1 Minute Warning</Button>
          <CheckBox
            title="Play sound and speech at the end of each round"
            checked={formValues.playEndOfRoundSound}
            onPress={()=> {handleInputChange('playEndOfRoundSound', !formValues.playEndOfRoundSound)}}
            containerStyle={{backgroundColor: 'transparent'}}
          />
          <MyInput
            title="End of round speech (optional)"
            value={(formValues?.endOfRoundSpeech ? formValues.endOfRoundSpeech : "")}
            placeholder="Enter end of round speech here. It will be followed automatically by 'The blinds are now ___ and ___ ...'"
            onChangeText={(text) => handleInputChange('endOfRoundSpeech', text)}
            keyboardType="default"
            multiline={true}
            disabled={!formValues?.playEndOfRoundSound}
          />
          <Button disabled={!formValues.playEndOfRoundSound || playingSound} buttonStyle={[ , {marginHorizontal: responsiveFontSize(10), }]}  titleStyle={[ , {fontSize: responsiveFontSize(1.5)}]} onPress={()=> soundCheckEndOfRound()}>Test End of Round</Button>
        </View>
        <View style={{flex: orientation == 'portrait' ? 1 : 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
          <Text> </Text>
          <SubmitButton 
            mutation={updateTimer}
            // disabled={!isDirty()}
            navigation={()=> props.navigation.goBack()}
          />
        </View>
      </AppLayout>
    )
  }
}

const UPDATE_TIMER_MUTATION = gql`
  mutation updateTimer(
    $id: uuid!, 
    $playOneMinuteRemainingSound: Boolean, 
    $oneMinuteRemainingSpeech: String, 
    $playEndOfRoundSound: Boolean, 
    $endOfRoundSpeech: String, 
    $backgroundColor: String
    ) 
    {update_timers_by_pk(pk_columns: {id: $id}, _set: {
      playOneMinuteRemainingSound: $playOneMinuteRemainingSound, 
      oneMinuteRemainingSpeech: $oneMinuteRemainingSpeech, 
      playEndOfRoundSound: $playEndOfRoundSound,
      endOfRoundSpeech: $endOfRoundSpeech,
      backgroundColor: $backgroundColor
      }) 
    {
      playOneMinuteRemainingSound
      oneMinuteRemainingSpeech
      playEndOfRoundSound
      endOfRoundSpeech
      backgroundColor
      id
    }
  }
`
const GET_TIMER_QUERY = gql`
  query Timer($id: uuid!) {
    timers_by_pk(id: $id) {
      playOneMinuteRemainingSound
      oneMinuteRemainingSpeech
      playEndOfRoundSound
      endOfRoundSpeech
      backgroundColor
      id
    }
  }
`