import React, { useState } from 'react'
import { getTournamentCostsQuery, updateCostMutation} from '../constants/GQL'
import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'
import { dictionaryLookup } from '../utilities/functions'
import { useMutation } from '@apollo/client'

export default (props) => {
  const initialValues = {} = props.navigation.getParam('cost')
  const [formValues, setFormValues] = useState(initialValues)
  const [updateCost] = useMutation(updateCostMutation, {
    variables: {
      ...formValues,
    },
    optimisticResponse: {
      updateCost: {
        ...formValues,
      }      
    },
    update: (cache, mutationResponse) => {
      try {
        const {data: { updateCost }} = mutationResponse
        let cacheData = cache.readQuery({ 
          query: getTournamentCostsQuery, 
          variables: {id: props.navigation.getParam('tID')}, 
        })
        cacheData = {
          Tournament: {
            ...cacheData.Tournament,
            costs: [...cacheData.Tournament.costs.filter(i => i.id !== updateCost.id), updateCost]
          }
        }
        cache.writeQuery({ 
          query: getTournamentCostsQuery, 
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

  return(
    <FormView contentContainerStyle={{backgroundColor: 'white', flex: 1, flexDirection: 'column', justifyContent: 'flex-start', paddingLeft: 5, paddingRight: 5}}>
    <MyInput
      title="Price"
      value={(formValues.price || "").toString()}
      placeholder="Enter price here..."
      onChangeText={(text) => handleInputChange('price', parseInt(text))}
      keyboardType="numeric"
    />
    <MyInput
      title="Chips"
      value={(formValues.chipStack || "").toString()}
      placeholder="Enter chip value..."
      onChangeText={(text) => handleInputChange('chipStack', parseInt(text))}
      keyboardType="numeric"
    />
    <Picker
      prompt="Choose entry fee type"
      title="Entry Fee Type"
      initialValue={initialValues.costType || "Pick entry fee type..."}
      selectedValue={formValues.costType}
      onValueChange={(itemValue, itemIndex) => handleInputChange('costType', itemValue)}
    >
      {dictionaryLookup("EntryFeeOptions").map((item, i) => (
        <Picker.Item key={i} label={item.longName} value={item.shortName}/>
      ))
      }
    </Picker>
    <SubmitButton 
      mutation={updateCost}
      disabled={!isDirty()}
    />
  </FormView>    
  )
}