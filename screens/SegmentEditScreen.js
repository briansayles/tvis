import React, { useState, } from 'react'
import { updateSegmentMutation} from '../constants/GQL'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup } from '../utilities/functions'
import { useMutation } from '@apollo/client'

export default (props) => {
  const [formValues, setFormValues] = useState({sBlind, bBlind, ante, duration, game, id} = props.navigation.getParam('segment'))
  const [updateSegment] = useMutation(updateSegmentMutation, {
    variables: {
      ...formValues,
    },
  })

  const handleInputChange = (fieldName, value) => {
    setFormValues({...formValues, [fieldName]:value})
  }

  const isDirty = () => {
    const {sBlind: p1, bBlind: p2, ante: p3, duration: p4, game: p5} = props.navigation.getParam('segment')
    const {sBlind: f1, bBlind: f2, ante: f3, duration: f4, game: f5} = formValues
    return p1 != f1 || p2 != f2 || p3 != f3 || p4 != f4 || p5 != f5
  }

  return (
    <FormView contentContainerStyle={{backgroundColor: 'white', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
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
        initialValue={formValues.duration || "Pick duration..."}
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
        id={formValues.id}
        disabled={!isDirty()}
      />
     </FormView>
  )
}