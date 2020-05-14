import { useQuery, useMutation, } from '@apollo/client'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, } from 'react-native'
import { Icon, } from 'react-native-elements'
import { SwipeListView } from 'react-native-swipe-list-view'

import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/FormComponents'

import { responsiveFontSize } from '../utilities/functions'
import { currentUserQuery, getTournamentPayoutLevelsQuery, createTournamentPayoutLevelMutation, deletePayoutLevelMutation} from '../constants/GQL'

export default (props) => {
  const [refreshingState, setRefreshingState] = useState(false)
	const {loading, data, error, refetch} = useQuery(getTournamentPayoutLevelsQuery, { variables: { id: props.navigation.getParam('id') } })
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)

  const [deletePayoutLevel] = useMutation(deletePayoutLevelMutation, {})

  const [createTournamentPayoutLevel] = useMutation(createTournamentPayoutLevelMutation,
    {
      variables:
      {
        "tournamentId": props.navigation.getParam('id'),
        "levelNumber": data.Tournament._payoutLevelsMeta.count,
        "payCount": 1,
        "playerCount": 5,
      },
      optimisticResponse: {
        createPayoutLevel: {
          __typename: "PayoutLevel",
          id: "tbd",
          "levelNumber": data.Tournament._payoutLevelsMeta.count,
          "payCount": 1,
          "playerCount": 5,
        }
      },
      update: (cache, {data: { createPayoutLevel }}) => {
        try {
          let cacheData = cache.readQuery({ 
            query: getTournamentPayoutLevelsQuery, 
            variables: {id: props.navigation.getParam('id')}, 
          })
          cacheData = {
            Tournament: {
              ...cacheData.Tournament,
              payoutLevels: [...cacheData.Tournament.payoutLevels, createPayoutLevel],
              _payoutLevelsMeta: {
                count: cacheData.Tournament._payoutLevelsMeta.count + 1
              }
            }
          }
          cache.writeQuery({ 
            query: getTournamentPayoutLevelsQuery, 
            variables: {id: props.navigation.getParam('id')},
            data: cacheData,
          })
        } catch (error) {
          console.log('error: ' + error.message)
        }
      },
    }
  )
  
  addButtonPressed = () => {
    createTournamentPayoutLevel()
  }

  editButtonPressed = (payoutLevel) => {
    props.navigation.navigate('PayoutLevelEdit', {payoutLevel, 'tID': props.navigation.getParam('id')})
  }

  deleteButtonPressed = (args) => {
		if (args.id==="tbd") {return}
    Alert.alert(
      "Confirm Delete",
      "Delete: \n" + "Payout Level ?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
				{ text: "OK", onPress: () => 				
          deletePayoutLevel(
            {
              variables: {id: args.id},
							optimisticResponse: {
								deletePayoutLevel: {
									__typename: "PayoutLevel",
									id: args.id,
								}
              },
							update: (cache, mutationResponse) => {
								try {
									const { data: { deletePayoutLevel }} = mutationResponse
                  let cacheData = cache.readQuery({
                    query: getTournamentPayoutLevelsQuery, 
                    variables: {id: props.navigation.getParam('id')},
                   })
                  cacheData = {
                    Tournament: {
                      ...cacheData.Tournament,
                      payoutLevels: cacheData.Tournament.payoutLevels.filter(i => (i.id !== deletePayoutLevel.id)),
                      _payoutLevelsMeta: {
                        count: cacheData.Tournament._payoutLevelsMeta.count - 1
                      }        
                    }
                  }
									cache.writeQuery({
                    query: getTournamentPayoutLevelsQuery, 
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
    const { Tournament: {payoutLevels} } = data
    // const rawList = Tournament.payoutLevels
    const list = []
    var cumulativePlayerCount = 0
    var cumulativePayCount = 0
    for (var i = 0, len = payoutLevels.length; i < len; i++) {
      cumulativePlayerCount += payoutLevels[i].playerCount
      cumulativePayCount += payoutLevels[i].payCount
      list.push({cumulativePayCount, cumulativePlayerCount, id: payoutLevels[i].id, levelNumber: payoutLevels[i].levelNumber, rawItem: payoutLevels[i]})
    }
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
          data={list}
          ListHeaderComponent={
            <ListHeader 
            title="Payout Levels" 
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
              onPress={() => editButtonPressed(data.item.rawItem)}
              style={[styles.rowFront,]}
              underlayColor={'#AAA'}
            >
              <View style={{flex: 1, flexDirection: 'row'}}>
                <View style={{flex: 1.4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
                  <Text style={[styles.listItemTitle, ]}>
                    {'Pay ' + data.item.cumulativePayCount + ' for up to ' + data.item.cumulativePlayerCount + ' players.'}
                  </Text>
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
                  onPress={() => editButtonPressed(data.item.rawItem)}
              >
                <Icon
                  name='edit'
                  color='white'
                  type='font-awesome'
                />
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnRight]}
                  onPress={() => deleteButtonPressed(data.item.rawItem)}
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
})