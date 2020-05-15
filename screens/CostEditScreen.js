import { useMutation } from '@apollo/client'
import React, { useState, useEffect } from 'react'
import { ActivityIndicator, Alert, Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, } from 'react-native'
import { Button, Icon, Input, } from 'react-native-elements'

import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'

import { dictionaryLookup, responsiveFontSize } from '../utilities/functions'
import { getTournamentQuery, updateCostMutation, deleteCostMutation} from '../constants/GQL'

export default (props) => {
  const initialValues = {} = props.navigation.getParam('cost')
  const [formValues, setFormValues] = useState(initialValues)
  const [updateCost] = useMutation(updateCostMutation, {
    variables: {...formValues,},
    update: (cache, mutationResponse) => {props.navigation.goBack()}
  })
  const [deleteTournamentCost] = useMutation(deleteCostMutation, {})

  const deleteButtonPressed = (args) => {
		if (args.id==="tbd") {return}
    Alert.alert(
      "Confirm Delete",
      "Delete: \n" + dictionaryLookup(args.costType, "EntryFeeOptions", "long") + '?',
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
				{ text: "OK", onPress: () => 				
          deleteTournamentCost(
            {
              variables: {id: args.id},
							optimisticResponse: {
								deleteCost: {
									__typename: "Cost",
									id: args.id,
								}
              },
							update: (cache, mutationResponse) => {
								try {
									const { data: { deleteCost }} = mutationResponse
                  let cacheData = cache.readQuery({
                    query: getTournamentQuery, 
                    variables: {id: props.navigation.getParam('tID')},
                  })
                  cacheData = {
                    Tournament: {
                      ...cacheData.Tournament,
                      costs: cacheData.Tournament.costs.filter(i => (i.id !== deleteCost.id))
                    }
                  }
									cache.writeQuery({
                    query: getTournamentQuery, 
                    variables: {id: props.navigation.getParam('tID')},
                    data: cacheData, 
                  })
                  props.navigation.goBack()
								} catch (error) {
									console.log('error: ' + error.message)
								}
							}                            
            }
          )
        }
      ],
      { cancelable: false }
		)
  }

  const handleInputChange = (fieldName, value) => {
    if (fieldName==="costType" && !['Buyin', 'Rebuy', 'Addon'].includes(value)) {
      setFormValues({...formValues, [fieldName]:value, 'chipStack': 0})
    } else {
      setFormValues({...formValues, [fieldName]:value})
    }
  }

  const isDirty = () => {
    let result = false
    Object.keys(formValues).forEach((key, index) => { if (formValues[key] !== initialValues[key]) result = true })
    return result
  }

  return(
    <FormView>
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
      <MyInput
        title="Price"
        value={(formValues.price || "").toString()}
        placeholder="Enter price here..."
        onChangeText={(text) => handleInputChange('price', parseInt(text))}
        keyboardType="numeric"
      />
      {['Buyin', 'Rebuy', 'Addon'].includes(formValues.costType) && <MyInput
        title="Chips"
        value={(formValues.chipStack || "").toString()}
        placeholder="Enter chip value..."
        onChangeText={(text) => handleInputChange('chipStack', parseInt(text))}
        keyboardType="numeric"
      />}
      <View style={{
          marginTop: responsiveFontSize(4),
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
      }}>
        <Button
          onPress={()=>deleteButtonPressed(initialValues)}
          icon={
            <Icon
              name="ios-trash"
              color="red"
              type="ionicon"
              size={responsiveFontSize(6)}
            />
          }
          type="clear"
        />
        <SubmitButton 
          mutation={updateCost}
          disabled={!isDirty()}
        />
      </View>
    </FormView>    
  )
}