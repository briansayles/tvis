import React, { useState, } from 'react'
import { getTournamentChipsQuery, updateChipMutation} from '../constants/GQL'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup } from '../utilities/functions'
import { useMutation, } from '@apollo/client'

export default (props) => {
  const initialValues = {} = props.navigation.getParam('chip')
  const [formValues, setFormValues] = useState(initialValues)
  const [updateChip] = useMutation(updateChipMutation, {
    variables: {
      ...formValues,
    },
    optimisticResponse: {
      updateChip: {
        ...formValues,
      }      
    },
    update: (cache, mutationResponse) => {
      try {
        const {data: { updateChip }} = mutationResponse
        let cacheData = cache.readQuery({ 
          query: getTournamentChipsQuery, 
          variables: {id: props.navigation.getParam('tID')}, 
        })
        cacheData = {
          Tournament: {
            ...cacheData.Tournament,
            chips: [...cacheData.Tournament.chips.filter(i => i.id !== updateChip.id), updateChip]
          }
        }
        cache.writeQuery({ 
          query: getTournamentChipsQuery, 
          variables: {id: props.navigation.getParam('tID')},
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
        title="Denomination"
        value={(formValues.denom || "").toString()}
        placeholder="Enter denomination here..."
        onChangeText={(text) => handleInputChange('denom', parseInt(text))}
        keyboardType="numeric"
      />
      <Picker
        prompt="Choose a color"
        title="Chip color"
        initialValue={initialValues.color || "Pick color..."}
        selectedValue={formValues.color || '#fff'}
        onValueChange={(itemValue, itemIndex) => handleInputChange('color', itemValue)}
      >
        {dictionaryLookup("ChipColorOptions").map((item, i) => (
          <Picker.Item key={i} label={item.longName} value={item.shortName}/>
        ))
        }
      </Picker>
      <SubmitButton 
        mutation={updateChip}
        disabled={!isDirty()}
      />
    </FormView>
  )
}