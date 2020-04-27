import { useMutation } from '@apollo/client'
import React, { useState, } from 'react'

import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'

import { dictionaryLookup, } from '../utilities/functions'
import { updateSegmentMutation} from '../constants/GQL'

export default (props) => {
  const initialValues = {} = props.navigation.getParam('segment')
  const [formValues, setFormValues] = useState(initialValues)
  const [updateSegment] = useMutation(updateSegmentMutation, {
    variables: {
      ...formValues,
    },
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
        title="Small Blind"
        value={(formValues.sBlind || "").toString()}
        placeholder="Enter small blind here..."
        onChangeText={(text) => handleInputChange('sBlind', parseInt(text))}
        keyboardType="numeric"
      />
      <MyInput
        title="Big Blind"
        value={(formValues.bBlind || "").toString()}
        placeholder="Enter big blind here..."
        onChangeText={(text) => handleInputChange('bBlind', parseInt(text))}
        keyboardType="numeric"
        onFocus={(currentText = '') => {
          setFormValues({...formValues, bBlind: formValues.bBlind || parseInt(formValues.sBlind) * 2})
        }}
      />
      <MyInput
        title="Ante"
        value={(formValues.ante || "").toString()}
        placeholder="Enter ante here..."
        onChangeText={(text) => handleInputChange('ante', parseInt(text))}
        keyboardType="numeric"
      />
      <Picker
        prompt="Choose your duration"
        title="Duration (in minutes)"
        initialValue={initialValues.duration || "Pick duration..."}
        selectedValue={formValues.duration}
        onValueChange={(itemValue, itemIndex) => handleInputChange('duration', parseInt(itemValue))}
      >
        {dictionaryLookup("DurationOptions").map((item, i) => (
          <Picker.Item key={i} label={item.longName} value={parseInt(item.shortName)}/>
        ))
        }
      </Picker>
      <SubmitButton 
        mutation={updateSegment}
        disabled={!isDirty()}
      />
     </FormView>
  )
}