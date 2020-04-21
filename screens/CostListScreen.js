import React, { useState } from 'react'
import { currentUserQuery, getTournamentCostsQuery, createTournamentCostMutation, deleteCostMutation, } from '../constants/GQL'
import { dictionaryLookup, sortEntryFees, responsiveFontSize} from '../utilities/functions'
import { ActivityIndicator, Alert, Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, } from 'react-native'
import { Icon, } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view'
import { BannerAd } from '../components/Ads'
import { ListHeader } from '../components/FormComponents'
import { useQuery, useMutation } from '@apollo/client'

export default (props) => {
  const [refreshingState, setRefreshingState] = useState(false)
	const {loading, data, error, refetch} = useQuery(getTournamentCostsQuery, { variables: { id: props.navigation.getParam('id') } })
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
  const [createTournamentCost] = useMutation(createTournamentCostMutation, {})
  const [deleteTournamentCost] = useMutation(deleteCostMutation, {})

  addButtonPressed = () => {
    createTournamentCost(
      {
        variables:
        {
          "tournamentId": props.navigation.getParam('id'),
          "costType": "Buyin",
          "price": 20,
          "chipStack": 1000,
        },
        optimisticResponse: {
          createCost: {
            __typename: "Cost",
            id: "tbd",
            price: 20,
            chipStack: 1000,
            costType: "Buyin",
            _buysMeta: { count: 0},
          }
        },
        update: (cache, {data: { createCost }}) => {
					try {
            let cacheData = cache.readQuery({ 
              query: getTournamentCostsQuery, 
              variables: {id: props.navigation.getParam('id')}, 
            })
            cacheData = {
              Tournament: {
                ...cacheData.Tournament,
                costs: [...cacheData.Tournament.costs, createCost]
              }
            }
            cache.writeQuery({ 
              query: getTournamentCostsQuery, 
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

  editButtonPressed = (id) => {
    props.navigation.navigate('CostEdit', id)
  }

  deleteButtonPressed = (args) => {
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
                    query: getTournamentCostsQuery, 
                    variables: {id: props.navigation.getParam('id')},
                  })
                  cacheData = {
                    Tournament: {
                      ...cacheData.Tournament,
                      costs: cacheData.Tournament.costs.filter(i => (i.id !== deleteCost.id))
                    }
                  }
									cache.writeQuery({
                    query: getTournamentCostsQuery, 
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
    const { Tournament: {costs} } = data
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
          data={sortEntryFees(costs)}
          ListHeaderComponent={
            <ListHeader 
            title="Entry Fees" 
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
              onPress={() => editButtonPressed(data.item.id)}
              style={[styles.rowFront,]}
              underlayColor={'#AAA'}
            >
              <View style={{flex: 1, flexDirection: 'row', }}>
                <View style={{flex: 0.4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
                  <Text style={[styles.listItemTitle, styles.textBold, ]}>
                    {data.item.costType && dictionaryLookup(data.item.costType, "EntryFeeOptions", "long") + ": " + (data.item.price && data.item.price.toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true}))}
                  </Text>
                  {/* <Text style={[styles.listItemSubtitle,]}>
                    {'Tournament value: ' + data.item.denom}
                  </Text> */}
                </View>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: responsiveFontSize(2)}}>
                  <Text style={[styles.listItemTitle, ]}>{data.item.chipStack && data.item.chipStack.toLocaleString() + ' Chips, ' + data.item._buysMeta.count + ' buys.'}</Text>
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
                  onPress={() => editButtonPressed(data.item.id)}
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