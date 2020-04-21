import { useQuery, useMutation} from '@apollo/client'
import React, { useState } from 'react'
import {graphql, compose} from 'react-apollo'
import { ActivityIndicator, Text, View, StyleSheet, TouchableHighlight, TouchableOpacity, } from 'react-native'
import { ListItem, Button, Card, Icon} from 'react-native-elements'
import { currentUserQuery, getTournamentBuysQuery, createCostBuyMutation, deleteBuyMutation} from '../constants/GQL'
import { dictionaryLookup, sortEntryFees, totalItems, responsiveFontSize} from '../utilities/functions'
import { AddButton, RemoveButton, ListHeader, } from '../components/FormComponents'
import { BannerAd } from '../components/Ads'
import { SwipeListView } from 'react-native-swipe-list-view'

export default (props) => {
  const [refreshingState, setRefreshingState] = useState(false)
  const { data, loading, error, refetch } = useQuery( getTournamentBuysQuery, { variables: { id: props.navigation.getParam('id')}})
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
  const [createCostBuy] = useMutation(createCostBuyMutation, {})
  const [deleteBuy] = useMutation(deleteBuyMutation, {})

  addButtonPressed = (args) => {
    createCostBuy(
      {
        variables: {
          "costId": args.id,
        },
        optimisticResponse: {
          createBuy: {
            __typename: "Buy",
            id: "tbd",
            player: {
              id: null,
            },
          }
        },
        update: ( cache, {data: {createBuy}}) => {
          try {
            let cacheData = cache.readQuery({
              query: getTournamentBuysQuery,
              variables: { id: props.navigation.getParam('id')},
            })
            let costItem = cacheData.Tournament.costs.find(cost => cost.id === args.id)
            let { buys } = costItem
            buys = [...buys, createBuy]
            costItem = {
              ...costItem,
              _buysMeta: {
                ...costItem._buysMeta,
                count: costItem._buysMeta.count + 1
              },
              buys: buys
            }
            cacheData = {
              Tournament: {
                ...cacheData.Tournament,
                costs: [...cacheData.Tournament.costs.filter(i => (i.id !== costItem.id)), costItem]
              }
            }
            cache.writeQuery({
              query: getTournamentBuysQuery,
              variables: { id: props.navigation.getParam('id')},
              data: cacheData, 
            })
          } catch (error) {
            console.log(error.message)
          }
        },
      }
    )
  }

  deleteButtonPressed = (args) => {
    console.log(args)
    console.log(args.buys[0])
    deleteBuy(
      {
        variables: {
          "id": args.buys[0].id,
        },
        optimisticResponse: {
          deleteBuy: {
            __typename: "Buy",
            "id": args.buys[0].id,
          }
        },
        update: ( cache, {data: {deleteBuy}}) => {
          try {
            let cacheData = cache.readQuery({
              query: getTournamentBuysQuery,
              variables: { id: props.navigation.getParam('id')},
            })
            console.log(cacheData)
            let costItem = cacheData.Tournament.costs.find(cost => cost.id === args.id)
            let { buys } = costItem
            console.log(buys)
            buys = buys.filter(buy => buy.id !== args.buys[0].id)
            console.log(buys)
            costItem = {
              ...costItem,
              _buysMeta: {
                ...costItem._buysMeta,
                count: costItem._buysMeta.count - 1
              },
              buys: buys
            }
            cacheData = {
              Tournament: {
                ...cacheData.Tournament,
                costs: [...cacheData.Tournament.costs.filter(i => (i.id !== costItem.id)), costItem]
              }
            }
            // console.log(cacheData)
            cache.writeQuery({
              query: getTournamentBuysQuery,
              variables: { id: props.navigation.getParam('id')},
              data: cacheData, 
            })
          } catch (error) {
            console.log(error.message)
          }
        },
      }
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
            title="Buys" 
            showAddButton={false} 
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
              style={[styles.rowFront,]}
              underlayColor={'#AAA'}
            >
              <View style={{flex: 1, flexDirection: 'row', }}>
                <View style={{flex: 0.8, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
                  <Text style={[styles.listItemTitle, ]}>
                    {(data.item.price).toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true})} {dictionaryLookup(data.item.costType, "EntryFeeOptions", "longName")} ({data.item._buysMeta.count})
                  </Text>
                  <Text style={[styles.listItemSubtitle,]}>
                    Chips Issued: {(data.item._buysMeta.count * data.item.chipStack).toLocaleString()}
                  </Text>
                </View>
                <View style={{flex: 0.6, justifyContent: 'center', alignItems: 'flex-end', paddingRight: responsiveFontSize(2)}}>
                  <Text style={[styles.listItemTitle, ]}>
                    Cash In: {(data.item._buysMeta.count * data.item.price).toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true})}
                  </Text>
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
                  onPress={() => deleteButtonPressed(data.item)}
              >
                <Icon
                  name='ios-remove'
                  color='white'
                  type='ionicon'
                />
              </TouchableOpacity>
              <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnRight]}
                  onPress={() => addButtonPressed(data.item)}
              >
                <Icon
                  name='ios-add'
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
    color: '#333'
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
    backgroundColor: 'red',
    right: 80,
  },
  backRightBtnCenter: {
    backgroundColor: 'red',
    right: 40,
  },
  backRightBtnRight: {
      backgroundColor: 'green',
      right: 0,
  },
})