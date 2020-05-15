import { useMutation, } from '@apollo/client'
import React, { useState, } from 'react'

import { FormView, SubmitButton, MyInput, } from '../components/FormComponents'

import { updateTimerMutation, } from '../constants/GQL'

export default ((props) => {
  const initialValues = {} = props.navigation.getParam('timer')
  const [formValues, setFormValues] = useState(initialValues)
	const [ updateTimer ] = useMutation(updateTimerMutation, {
    variables: {...formValues, },
    update: (cache, mutationResponse) => {props.navigation.goBack()}
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
        mutation={updateTimer}
        disabled={!isDirty()}
      />
    </FormView>
  )    
})