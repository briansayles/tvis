import React, { useState } from 'react'
import { ActivityIndicator, Text, View, ScrollView, StyleSheet, RefreshControl, Modal, TouchableHighlight, Linking, AsyncStorage} from 'react-native'
import { ListItem, } from 'react-native-elements'
import { currentUserQuery, getTournamentSegmentsQuery, createTournamentSegmentMutation, deleteSegmentMutation} from '../constants/GQL'
import { sortSegments,  } from '../utilities/functions'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/FormComponents'
import { responsiveFontSize } from '../utilities/functions'
import { useQuery, useMutation } from '@apollo/client'

export default (props) => {
  const [refreshingState, setRefreshingState] = useState(false)
  const [loadingState, setLoadingState] = useState(false) 
	const {loading, data, error, client, refetch} = useQuery(getTournamentSegmentsQuery, { variables: { id: props.navigation.getParam('id') } })
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
  const [createTournamentSegment] = useMutation(createTournamentSegmentMutation, {})
  const [deleteTournamentSegment] = useMutation(deleteSegmentMutation, {})

  _addButtonPressed = (parentId, duration) => {
    // setLoadingState(true)
    createTournamentSegment(
      {
        variables:
        {
          "tournamentId": parentId,
          "sBlind": 0,
          "bBlind": 0,
          "duration": duration,
        }
      }
    ).then(() => refetch())
  }

	_editButtonPressed = (segment) => {
    props.navigation.navigate('SegmentEdit', {segment: segment})
  }

  _deleteButtonPressed = (id) => {
    // setLoadingState(true)
    deleteTournamentSegment({variables: {id: id} }).then(
      () => refetch()
    )
  }

  if (loading || loadingUser) {
    return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
  } else if (error || errorUser) {
  return <Text>Error! {error && error.message} {errorUser && errorUser.message}</Text>
  } else {
    const { Tournament } = data
    const { user } = dataUser
    const userIsOwner = user.id === Tournament.user.id
    const { segments } = Tournament
    const list = sortSegments(segments)
    return (
      <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'white', }}>
        <ListHeader 
          title="Blinds" 
          showAddButton={userIsOwner} 
          loading={loadingState} 
          onAddButtonPress={()=>_addButtonPressed(Tournament.id)}
        />
        <ScrollView 
          style={{flex: 1, marginLeft: 5, marginRight: 5}}
          refreshControl={
            <RefreshControl
              refreshing={refreshingState}
  						onRefresh={()=>refetch()}
            />
          }
        >
          <View>
            {
              list && list.map((item, i) => (
                <Swipeout
                  key={i}
                  autoClose={true}
                  right={[
                    {
                      text: 'Edit',
                      onPress: ()=> editButtonPressed(item),
                      type: 'primary',
                    },
                    {
                      text: 'DELETE',
                      onPress: () => _deleteButtonPressed(item.id),
                      backgroundColor: '#ff0000',
                      type: 'delete',
                    },
                  ]}
                >
                <ListItem
                  title={(item.sBlind || 0) + "/" + (item.bBlind || 0) + (item.ante ? " + " + item.ante + " ante" : "")}
                  subtitle={item.duration + " minutes"}
                  onPress={()=> editButtonPressed(item)}
                  titleStyle={[ styles.listItemTitle, ]}
                  subtitleStyle={[ styles.listItemSubtitle, ]}
                  bottomDivider
                  chevron
                />
                </Swipeout>
              ))
            }
          </View>
        </ScrollView>
        <BannerAd/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  active: {
    fontWeight: 'bold',
  },
  listItemTitle: {
    fontSize: responsiveFontSize(1.75),

  },
  listItemSubtitle: {
    fontSize: responsiveFontSize(1.5),
    color: '#888'
  }
});