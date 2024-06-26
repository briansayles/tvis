import { useMutation, useQuery, gql,  } from '@apollo/client'
import React, { useState, useEffect} from 'react'
import { ActivityIndicator, View, useWindowDimensions, ScrollView, SafeAreaView} from 'react-native'
import { SubmitButton, MyInput, DeleteButton, } from '../components/FormComponents'
import { ErrorMessage } from '../components/ErrorMessage'
import { styles } from '../styles'
import { AppLayout } from '../components/AppLayout'
import { KeyboardAwareScrollView, } from 'react-native-keyboard-aware-scroll-view'
import { responsiveFontSize } from '../styles'

export const SegmentEditScreen = (props) => {
  const { height, width } = useWindowDimensions()
  const orientation = height > width ? 'portrait' : 'landscape'
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const {data, loading, error} = useQuery(GET_SEGMENT_QUERY, {variables: {id: props.route.params.id}})
  const [ deleteSegment, {loading: deletingSegment, data: deleteSegmentData, error: deleteSegmentError} ] = useMutation(DELETE_SEGMENT_MUTATION, {
    variables: {
      id: props.route.params.id
    }
  })
  const [updateSegment] = useMutation(UPDATE_SEGMENT_MUTATION, {
    variables: {
      ...formValues,
    },
  })

  useEffect(()=>{
    if (data) {
      setInitialValues(data.segments_by_pk)
      setFormValues(data.segments_by_pk)
    }
  },[data])
  
  const handleInputChange = (fieldName, value) => {
    setFormValues({...formValues, [fieldName]:value})
  }

  const isDirty = () => {
    let result = false
    Object.keys(formValues).forEach((key, index) => { if (formValues[key] !== initialValues[key]) result = true })
    return result
  }

  if (loading) return (<ActivityIndicator/>)
  if (error) return (<ErrorMessage error={error}/>)
  if (data && formValues !== null && initialValues !== null) {
    return (
      // <FormView>
        <SafeAreaView style={{flexDirection: 'column', flex: 1}}>
          <ScrollView style={[styles.inputScrollView, {flex: 12, flexDirection: 'column'}]}>
            <MyInput
              title="Small Blind"
              value={(formValues.sBlind.toString()).replace(/^0+/, '')}
              placeholder="Enter small blind here..."
              onChangeText={(text) => handleInputChange('sBlind', (!text ? 0 : text))}
              keyboardType="numeric"
            />
            <MyInput
              title="Big Blind"
              value={(formValues.bBlind).toString().replace(/^0+/, '')}
              placeholder="Enter big blind here..."
              onChangeText={(text) => handleInputChange('bBlind', (!text ? 0 : text))}
              keyboardType="numeric"
              onFocus={(currentText = '') => {
                setFormValues({...formValues, bBlind: formValues.bBlind || (formValues.sBlind) * 2})
              }}
            />
            <MyInput
              title="Ante"
              value={(formValues.ante).toString().replace(/^0+/, '')}
              placeholder="Enter ante here..."
              onChangeText={(text) => handleInputChange('ante', (!text ? 0 : text))}
              keyboardType="numeric"
            />
            <MyInput
              title="Duration (Minutes)"
              value={(formValues.duration).toString().replace(/^0+/, '')}
              placeholder="Enter duration here..."
              onChangeText={(text) => handleInputChange('duration', (!text ? 0 : text))}
              keyboardType="numeric"
            />
          </ScrollView>
          <View style={[styles.inputScreenButtonsView, {flex: orientation=='portrait' ? 0.5 : 0.15,}]}>
            <DeleteButton
              mutation={deleteSegment}
              navigation={()=> props.navigation.goBack()}
              confirmationString={'Are you sure you want to delete this segment?'}
              confirmationTitleString='Confirm Deletion'
            />
            <SubmitButton 
              mutation={updateSegment}
              // disabled={!isDirty()}
              navigation={()=> props.navigation.goBack()}
            />
          </View>
        </SafeAreaView>
      //<FormView>
    )
  }
  return null
}

const UPDATE_SEGMENT_MUTATION = gql`
  mutation UpdateSegment($bBlind: numeric = 0, $ante: numeric = 0, $duration: numeric = 0, $sBlind: numeric = 0, $id: uuid!) {
    update_segments_by_pk(pk_columns: {id: $id}, _set: {sBlind: $sBlind, bBlind: $bBlind, ante: $ante, duration: $duration}) {
      id
      sBlind
      bBlind
      ante
      duration
    }
  }
`
const DELETE_SEGMENT_MUTATION = gql`
  mutation DeleteSegment($id: uuid!) {
    delete_segments_by_pk(id: $id) {
      id
    }
  }
`
const GET_SEGMENT_QUERY = gql`
  query Segment($id: uuid!) {
    segments_by_pk(id: $id) {
      id
      sBlind
      bBlind
      ante
      duration
    }
  }
`