import React, { useState, } from 'react'
import { updateTournamentTimerMutation, } from '../constants/GQL'
import { FormView, SubmitButton, MyInput, } from '../components/FormComponents'
import { useMutation, } from '@apollo/client'

export default ((props) => {
  const initialValues = {} = props.navigation.getParam('timer')
  const [formValues, setFormValues] = useState(initialValues)
	const [ updateTournamentTimer ] = useMutation(updateTournamentTimerMutation, {
    variables: {
      ...formValues,
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
        title="One Minute Remaining Speech"
        value={formValues.oneMinuteRemainingSpeech || ""}
        placeholder="Enter speech here for one minute remaining..."
        onChangeText={(text) => handleInputChange('oneMinuteRemainingSpeech', text)}
      />
      <MyInput
        title="End of Round Speech"
        value={formValues.endOfRoundSpeech || ""}
        placeholder="Enter speech here for the end of round..."
        onChangeText={(text) => handleInputChange('endOfRoundSpeech', text)}
      />
      <SubmitButton 
        mutation={updateTournamentTimer}
        disabled={!isDirty()}
      />
    </FormView>
  )    
})