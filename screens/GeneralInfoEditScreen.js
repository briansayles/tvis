import React, { useState, } from 'react'
import { updateTournamentMutation, getTournamentQuery } from '../constants/GQL'
import { dictionaryLookup } from '../utilities/functions'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { useMutation } from '@apollo/client'

export default (props) => {
  const [formValues, setFormValues] = useState({title, subtitle, comments, game} = props.navigation.getParam('tourney'))
  const [updateTournament] = useMutation(updateTournamentMutation, {
    variables: {...formValues},
    optimisticResponse: {
      updateTournament: {
        __typename: "Tournament",
        id: props.navigation.getParam('tourney').id,
        ...formValues,
      }      
    },
    update: (cache, mutationResponse)=> {
      try {
        const { data: { updateTournament }} = mutationResponse
        let cacheData = cache.readQuery({ 
          query: getTournamentQuery,
          variables: {id: props.navigation.getParam('tourney').id},
        })
        cacheData = {
          Tournament: {
            ...cacheData.Tournament,
            ...updateTournament
          }							
        }
        cache.writeQuery({
          query: getTournamentQuery,
          variables: {id: props.navigation.getParam('tourney').id},
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
    const {title: p1, subtitle: p2, comments: p3, game: p4} = props.navigation.getParam('tourney')
    const {title: f1, subtitle: f2, comments: f3, game: f4} = formValues
    return p1 != f1 || p2 != f2 || p3 != f3 || p4 != f4
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
        id = {props.navigation.getParam('tourney').id}
        disabled={!isDirty()}
      />
    </FormView>
  )
}