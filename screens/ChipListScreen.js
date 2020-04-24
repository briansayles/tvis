import React, { useState } from 'react'
import { ActivityIndicator, Alert, Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, } from 'react-native'
import { Icon, } from 'react-native-elements';
import { currentUserQuery, getTournamentChipsQuery, createTournamentChipMutation, deleteChipMutation,} from '../constants/GQL'
import { sortChips, numberToSuffixedString, dictionaryLookup } from '../utilities/functions'
import { SwipeListView } from 'react-native-swipe-list-view'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/FormComponents'
import { responsiveFontSize } from '../utilities/functions'
import { useQuery, useMutation } from '@apollo/client'

export default (props) => {
  const [refreshingState, setRefreshingState] = useState(false)
	const {loading, data, error, refetch} = useQuery(getTournamentChipsQuery, { variables: { id: props.navigation.getParam('id') } })
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
  const [createTournamentChip] = useMutation(createTournamentChipMutation, {})
  const [deleteTournamentChip] = useMutation(deleteChipMutation, {})

  addButtonPressed = () => {
    createTournamentChip(
      {
        variables:
        {
          "tournamentId": props.navigation.getParam('id'),
          "denom": 1,
          "color": "#fff",
        },
        optimisticResponse: {
          createChip: {
            __typename: "Chip",
            id: "tbd",
            denom: 1,
            color: "#fff",
            textColor: "#000",
            rimColor: "#fff",
          }
        },
        update: (cache, {data: { createChip }}) => {
					try {
            let cacheData = cache.readQuery({ 
              query: getTournamentChipsQuery, 
              variables: {id: props.navigation.getParam('id')}, 
            })
            cacheData = {
              Tournament: {
                ...cacheData.Tournament,
                chips: [...cacheData.Tournament.chips, createChip]
              }
            }
            cache.writeQuery({ 
              query: getTournamentChipsQuery, 
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

  editButtonPressed = (chip) => {
    props.navigation.navigate('ChipEdit', {chip, 'tID': props.navigation.getParam('id')})
  }

  deleteButtonPressed = (args) => {
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
                    query: getTournamentChipsQuery, 
                    variables: {id: props.navigation.getParam('id')},
                   })
                  cacheData = {
                    Tournament: {
                      ...cacheData.Tournament,
                      chips: cacheData.Tournament.chips.filter(i => (i.id !== deleteChip.id))
                    }
                  }
									cache.writeQuery({
                    query: getTournamentChipsQuery, 
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
    const { Tournament: {chips} } = data
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
          data={sortChips(chips)}
          ListHeaderComponent={
            <ListHeader 
            title="Chips" 
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
              <View style={{flex: 1, flexDirection: 'row', }}>
                <View style={{flex: 0.4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
                  <Text style={[styles.listItemTitle, styles.textBold, {color: dictionaryLookup(data.item.color, "ChipColorOptions", "short")}]}>
                    {dictionaryLookup(data.item.color, "ChipColorOptions", "long")}
                  </Text>
                  {/* <Text style={[styles.listItemSubtitle,]}>
                    {'Tournament value: ' + data.item.denom}
                  </Text> */}
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: responsiveFontSize(2)}}>
                  <Text style={[styles.listItemTitle, ]}>{'Tournament value: ' + data.item.denom}</Text>
                </View>
                <View style={{flex: 0.1, justifyContent: 'center', alignItems: 'center', }}>
                  <Icon
										name='ios-arrow-forward'
										color= 'black'
										type='ionicon'
									/>
                </View>
              </View>
            </TouchableHighlight>
          )}
          renderHiddenItem={ (data, rowMap) => (
            <View style={styles.rowBack}>
              {/* <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnLeft]}
                  onPress={() => copyButtonPressed(data.item.id)}
              >
                  <Text style={styles.backTextWhite}>C</Text>
              </TouchableOpacity> */}
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
                {/* <Text style={styles.backTextWhite}>DEL</Text> */}
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
  textBold: {
    fontWeight: 'bold',
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