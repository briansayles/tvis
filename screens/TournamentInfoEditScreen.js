import { useMutation, useQuery, gql,  } from '@apollo/client'
import React, { useState, useEffect} from 'react'
import { ActivityIndicator, View, useWindowDimensions, Text } from 'react-native'
import { SubmitButton, MyInput, } from '../components/FormComponents'
import { ErrorMessage } from '../components/ErrorMessage'
import { AppLayout } from '../components/AppLayout'

export const TournamentInfoEditScreen = (props) => {
  const { height, width } = useWindowDimensions()
  const orientation = height > width ? 'portrait' : 'landscape'
  const [initialValues, setInitialValues] = useState(null)
  const [formValues, setFormValues] = useState(null)
  const {data, loading, error, client, refetch} = useQuery(TOURNAMENT_QUERY, {variables: {id: props.route.params.id}})
  const [updateTournament] = useMutation(UPDATE_TOURNAMENT_MUTATION, {
    variables: {
      ...formValues,
    },
  })

  useEffect(()=>{
    if (data) {
      setInitialValues(data.tournaments_by_pk)
      setFormValues(data.tournaments_by_pk)
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
      <AppLayout>
        <View style={{flex: 9, flexDirection: 'column', justifyContent: 'flex-start'}}>
          <MyInput
            title="Title"
            value={(formValues?.title ? formValues.title : "")}
            placeholder="Enter tournament title here..."
            onChangeText={(text) => handleInputChange('title', text)}
            keyboardType="default"
          />
          <MyInput
            title="Subtitle"
            value={(formValues?.subtitle ? formValues.subtitle : "")}
            placeholder="Enter tournament subtitle here..."
            onChangeText={(text) => handleInputChange('subtitle', text)}
            keyboardType="default"
          />
        </View>
        <View style={{flex: orientation=='portrait' ? 1 : 3, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around'}}>
          <Text> </Text>
          <SubmitButton 
            mutation={updateTournament}
            navigation={()=> props.navigation.goBack()}
          />
        </View>
      </AppLayout>            
    )
  }
  return null
}

const TOURNAMENT_QUERY = gql`
  query TournamentQuery($id: uuid!) {
    tournaments_by_pk(id: $id) {
      id
      title
      subtitle
    }
  }
`
const DELETE_TOURNAMENT_MUTATION = gql`
  mutation DeleteTournament($id: uuid!) {
    delete_tournaments_by_pk(id: $id) {
      id
    }
  }
`
const UPDATE_TOURNAMENT_MUTATION = gql`
  mutation UpdateTournament($id: uuid!, $subtitle: String = "", $title: String = "") {
    update_tournaments_by_pk(pk_columns: {id: $id}, _set: {title: $title, subtitle: $subtitle}) {
      id
      subtitle
      title
    }
  }
`