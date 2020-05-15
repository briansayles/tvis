import { useMutation, } from '@apollo/client'
import React, { useState, } from 'react'
import { ActivityIndicator, Alert, Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, } from 'react-native'
import { Button, Icon, Input, } from 'react-native-elements'

import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'

import { dictionaryLookup, responsiveFontSize } from '../utilities/functions'
import { getTournamentQuery, updateChipMutation, deleteChipMutation } from '../constants/GQL'

export default (props) => {
  const initialValues = {} = props.navigation.getParam('chip')
  const [formValues, setFormValues] = useState(initialValues)
  const [updateChip] = useMutation(updateChipMutation, {
    variables: {...formValues,},
    update: (cache, mutationResponse) => {props.navigation.goBack()}
  })  
  const [deleteTournamentChip] = useMutation(deleteChipMutation, {})

  const deleteButtonPressed = (args) => {
		if (args.id==="tbd") {return}
    Alert.alert(
      "Confirm Delete",
      "Delete: \n" + dictionaryLookup(args.color, "ChipColorOptions", "long") + ' (value=' + args.denom + ') chip?',
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
				{ text: "OK", onPress: () => 				
          deleteTournamentChip(
            {
              variables: {id: args.id},
							optimisticResponse: {
								deleteChip: {
									__typename: "Chip",
									id: args.id,
								}
              },
							update: (cache, mutationResponse) => {
								try {
									const { data: { deleteChip }} = mutationResponse
                  let cacheData = cache.readQuery({
                    query: getTournamentQuery, 
                    variables: {id: props.navigation.getParam('tID')},
                  })
                  cacheData = {
                    Tournament: {
                      ...cacheData.Tournament,
                      chips: cacheData.Tournament.chips.filter(i => (i.id !== deleteChip.id))
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
        title="Denomination"
        value={(formValues.denom || "").toString()}
        placeholder="Enter denomination here..."
        onChangeText={(text) => handleInputChange('denom', parseInt(text))}
        keyboardType="numeric"
      />
      <MyInput
        title="Quantity Available (optional)"
        value={(formValues.qtyAvailable || "").toString()}
        placeholder="Enter number of chips available here..."
        onChangeText={(text) => handleInputChange('qtyAvailable', parseInt(text))}
        keyboardType="numeric"
      />
      <Picker
        prompt="Choose a color"
        title="Chip color"
        initialValue={initialValues.color || "Pick color..."}
        selectedValue={formValues.color || '#000'}
        onValueChange={(itemValue, itemIndex) => handleInputChange('color', itemValue)}
      >
        {dictionaryLookup("ChipColorOptions").map((item, i) => (
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
          mutation={updateChip}
          disabled={!isDirty()}
        />
     </View>

    </FormView>
  )
}