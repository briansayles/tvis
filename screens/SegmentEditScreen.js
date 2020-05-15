import { useMutation } from '@apollo/client'
import React, { useState, } from 'react'
import { ActivityIndicator, Alert, Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, } from 'react-native'
import { Button, Icon, Input, } from 'react-native-elements'

import { FormView, Picker, SubmitButton, MyInput, } from '../components/FormComponents'

import { dictionaryLookup, responsiveFontSize} from '../utilities/functions'
import { getTournamentQuery, updateSegmentMutation, deleteSegmentMutation} from '../constants/GQL'

export default (props) => {
  const initialValues = {} = props.navigation.getParam('segment')
  const [formValues, setFormValues] = useState(initialValues)
  const [updateSegment] = useMutation(updateSegmentMutation, {
    variables: {...formValues, },
    update: (cache, mutationResponse) => { props.navigation.goBack()}
  })
  const [deleteTournamentSegment] = useMutation(deleteSegmentMutation, {})

  const deleteButtonPressed = (args) => {
		if (args.id==="tbd") {return}
    Alert.alert(
      "Confirm Delete",
      "Delete: \n" + args.sBlind + '/' + args.bBlind + '/' + (args.ante || "No Ante") + " ?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
				{ text: "OK", onPress: () => 				
          deleteTournamentSegment(
            {
              variables: {id: args.id},
							optimisticResponse: {
								deleteSegment: {
									__typename: "Segment",
									id: args.id,
								}
              },
							update: (cache, mutationResponse) => {
								try {
									const { data: { deleteSegment }} = mutationResponse
                  let cacheData = cache.readQuery({
                    query: getTournamentQuery, 
                    variables: {id: props.navigation.getParam('tID')},
                   })
                  cacheData = {
                    Tournament: {
                      ...cacheData.Tournament,
                      segments: cacheData.Tournament.segments.filter(i => (i.id !== deleteSegment.id))
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
          mutation={updateSegment}
          disabled={!isDirty()}
        />
      </View>
    </FormView>
  )
}