import React, { useState } from 'react'
import { ActivityIndicator, Alert, Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, } from 'react-native'
import { Icon, } from 'react-native-elements';
import { currentUserQuery, getTournamentSegmentsQuery, createTournamentSegmentMutation, deleteSegmentMutation} from '../constants/GQL'
import { sortSegments,  } from '../utilities/functions'
import { SwipeListView } from 'react-native-swipe-list-view'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/FormComponents'
import { responsiveFontSize } from '../utilities/functions'
import { useQuery, useMutation } from '@apollo/client'

export default (props) => {
  const [refreshingState, setRefreshingState] = useState(false)
	const {loading, data, error, refetch} = useQuery(getTournamentSegmentsQuery, { variables: { id: props.navigation.getParam('id') } })
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
  const [createTournamentSegment] = useMutation(createTournamentSegmentMutation, {})
  const [deleteTournamentSegment] = useMutation(deleteSegmentMutation, {})

  addButtonPressed = () => {
    createTournamentSegment(
      {
        variables:
        {
          "tournamentId": props.navigation.getParam('id'),
          "duration": 0,
          "sBlind": 0,
          "bBlind": 0,
          "ante": 0,
          "game": "NLHE",
        },
        optimisticResponse: {
          createSegment: {
            __typename: "Segment",
            id: "tbd",
            duration: 0,
            sBlind: 0,
            bBlind: 0,
            ante: 0,
            game: "NLHE",
          }
        },
        update: (cache, {data: { createSegment }}) => {
					try {
            let cacheData = cache.readQuery({ 
              query: getTournamentSegmentsQuery, 
              variables: {id: props.navigation.getParam('id')}, 
            })
            cacheData = {
              Tournament: {
                ...cacheData.Tournament,
                segments: [...cacheData.Tournament.segments, createSegment]
              }
            }
            cache.writeQuery({ 
              query: getTournamentSegmentsQuery, 
              variables: {id: props.navigation.getParam('id')},
              data: cacheData,
            })
					} catch (error) {
						console.log('error: ' + error.message)
					}
        },
      }
    )
  }

  editButtonPressed = (segment) => {
    props.navigation.navigate('SegmentEdit', {segment, 'tID': props.navigation.getParam('id')})
  }

  deleteButtonPressed = (args) => {
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
                    query: getTournamentSegmentsQuery, 
                    variables: {id: props.navigation.getParam('id')},
                   })
                  cacheData = {
                    Tournament: {
                      ...cacheData.Tournament,
                      segments: cacheData.Tournament.segments.filter(i => (i.id !== deleteSegment.id))
                    }
                  }
									cache.writeQuery({
                    query: getTournamentSegmentsQuery, 
                    variables: {id: props.navigation.getParam('id')},
                    data: cacheData, 
                  })
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

  if (loading || loadingUser) {
    return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
  } else if (error || errorUser) {
  return <Text>Error! {error && error.message} {errorUser && errorUser.message}</Text>
  } else {
    const { user } = dataUser
    const userIsOwner = user.id === data.Tournament.user.id
    const { Tournament: {segments} } = data
    return (
			<View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'white', }}>
        <SwipeListView
          refreshing={refreshingState}
          onRefresh={()=>{
            setRefreshingState(true)
            refetch().then(()=> 
              setRefreshingState(false)
            )
          }}
          data={sortSegments(segments)}
          ListHeaderComponent={
            <ListHeader 
            title="Blinds Schedule" 
            showAddButton={userIsOwner} 
            onAddButtonPress={addButtonPressed}
            />
          }
          rightOpenValue={-80}
          stickyHeaderIndices={[0]}
          disableRightSwipe = {true}
          swipeToOpenPercent = {10}
          swipeToClosePercent = {10}
          closeOnRowBeginSwipe = {true}
          closeOnRowOpen = {true}
          closeOnRowPress = {true}
          closeOnScroll = {true}
          renderItem={ (data, rowMap) => (
            <TouchableHighlight
              onPress={() => editButtonPressed(data.item)}
              style={[styles.rowFront,]}
              underlayColor={'#AAA'}
            >
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
                  <Text style={[styles.listItemTitle, ]}>
                    {(data.item.sBlind || 0) + "/" + (data.item.bBlind || 0)}
                  </Text>
                  <Text style={[styles.listItemSubtitle, ]}>
                    {(data.item.ante ? " + " + data.item.ante + " ante" : "No Ante")}
                  </Text>
                </View>
                <View style={{flex: 0.40, justifyContent: 'center', alignItems: 'flex-end'}}>
                  <Text style={[styles.listItemTitle, ]}>{data.item.duration} Minutes</Text>
                </View>
                <View style={{flex: 0.1, justifyContent: 'center', alignItems: 'center'}}>
                  <Icon
										name='ios-arrow-forward'
										color='black'
										type='ionicon'
									/>
                </View>
              </View>
            </TouchableHighlight>
          )}
          renderHiddenItem={ (data, rowMap) => (
            <View style={styles.rowBack}>
              <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnCenter]}
                  onPress={() => editButtonPressed(data.item)}
              >
                <Icon
                  name='edit'
                  color='white'
                  type='font-awesome'
                />
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnRight]}
                  onPress={() => deleteButtonPressed(data.item)}
              >
                <Icon
                  name='ios-trash'
                  color='white'
                  type='ionicon'
                />
              </TouchableOpacity>
            </View>
          )}
        />
				<BannerAd />
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
  },
	backTextWhite: {
		color: '#FFF',
	},
	rowFront: {
		alignItems: 'flex-start',
		backgroundColor: '#DDD',
		borderBottomColor: 'white',
		borderBottomWidth: 1,
		justifyContent: 'center',
		height: 50,
		paddingLeft: responsiveFontSize(2)
	},
	rowBack: {
			alignItems: 'center',
			backgroundColor: '#DDD',
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'space-between',
			paddingLeft: 15,
	},
	backRightBtn: {
			alignItems: 'center',
			bottom: 0,
			justifyContent: 'center',
			position: 'absolute',
			top: 0,
			width: 40,
	},
	backRightBtnLeft: {
		backgroundColor: 'green',
		right: 80,
	},
	backRightBtnCenter: {
		backgroundColor: 'blue',
		right: 40,
	},
	backRightBtnRight: {
			backgroundColor: 'red',
			right: 0,
	},
});