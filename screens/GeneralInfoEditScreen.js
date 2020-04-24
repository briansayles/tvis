import React, { useState, } from 'react'
import { updateTournamentMutation, getTournamentQuery } from '../constants/GQL'
import { dictionaryLookup } from '../utilities/functions'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { useMutation } from '@apollo/client'

export default (props) => {
  const initialValues = {} = props.navigation.getParam('tourney')
  const [formValues, setFormValues] = useState(initialValues)
  const [updateTournament] = useMutation(updateTournamentMutation, {
    variables: {...formValues},
    optimisticResponse: {
      updateTournament: {
        __typename: "Tournament",
        id: initialValues.id,
        ...formValues,
      }      
    },
    update: (cache, mutationResponse)=> {
      try {
        const { data: { updateTournament }} = mutationResponse
        let cacheData = cache.readQuery({ 
          query: getTournamentQuery,
          variables: {id: initialValues.id},
        })
        cacheData = {
          Tournament: {
            ...cacheData.Tournament,
            ...updateTournament
          }							
        }
        cache.writeQuery({
          query: getTournamentQuery,
          variables: {id: initialValues.id},
          data: cacheData,
        })
      } catch (error) {
        console.log('error: ' + error.message)
      }      
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
    <FormView contentContainerStyle={{backgroundColor: 'white', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
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
      <SubmitButton 
        mutation={updateTournament}
        id = {initialValues.id}
        disabled={!isDirty()}
      />
    </FormView>
  )
}