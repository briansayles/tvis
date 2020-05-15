import { useMutation } from '@apollo/client'
import React, { useState, } from 'react'
import { ActivityIndicator, Alert, Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, } from 'react-native'
import { Button, Icon, Input, } from 'react-native-elements'

import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'

import { dictionaryLookup, responsiveFontSize } from '../utilities/functions'
import { updateTournamentMutation, getTournamentQuery } from '../constants/GQL'

export default (props) => {
  const initialValues = {} = props.navigation.getParam('tourney')
  const [formValues, setFormValues] = useState(initialValues)
  const [updateTournament] = useMutation(updateTournamentMutation, {
    variables: {...formValues},
    // optimisticResponse: {
    //   updateTournament: {
    //     ...formValues,
    //   }      
    // },
    update: (cache, mutationResponse)=> {
      // try {
      //   const { data: { updateTournament }} = mutationResponse
      //   let cacheData = cache.readQuery({ 
      //     query: getTournamentQuery,
      //     variables: {id: initialValues.id},
      //   })
      //   cacheData = {
      //     Tournament: {
      //       ...cacheData.Tournament,
      //       ...updateTournament
      //     }							
      //   }
      //   cache.writeQuery({
      //     query: getTournamentQuery,
      //     variables: {id: initialValues.id},
      //     data: cacheData,
      //   })
        props.navigation.goBack()
      // } catch (error) {
      //   console.log('error: ' + error.message)
      // }      
    }
  })

  const handleInputChange = (fieldName, value) => {
    setFormValues({...formValues, [fieldName]:value})
  }

  const isDirty = () => {
    let result = false
    Object.keys(formValues).forEach((key, index) => { if (formValues[key] !== initialValues[key]) result = true })
    return result
  }

  return (
    <FormView>
      <MyInput
        title="Title"
        value={formValues.title || ""}
        placeholder="Enter title here..."
        onChangeText={(text) => handleInputChange('title', text)}
      />     
      <MyInput
        title="Subtitle"
        value={formValues.subtitle || ""}
        placeholder="Enter subtitle here..."
        onChangeText={(text) => handleInputChange('subtitle', text)}
      />
      <MyInput
        style={{height: 100}}
        title="Comments"
        value={formValues.comments || ""}
        placeholder="Enter comments here..."
        onChangeText={(text) => handleInputChange('comments', text)}
        multiline = {true}
        numberOfLines = {6}
      />
      <Picker
        prompt="Choose your game"
        title="Game"
        initialValue={formValues.game || "Pick game..."}
        selectedValue={formValues.game}
        onValueChange={(itemValue, itemIndex) => handleInputChange('game', itemValue)}
      >
        {dictionaryLookup("GameOptions").map((item, i) => (
          <Picker.Item key={i} label={item.longName} value={item.shortName}/>
        ))
        }
      </Picker>
      <View style={{
        marginTop: responsiveFontSize(4),
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
      }}>
        <View></View>
        <SubmitButton 
          mutation={updateTournament}
          disabled={!isDirty()}
        />
     </View>
    </FormView>
  )
}