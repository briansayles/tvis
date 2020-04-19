import { useQuery, useMutation} from '@apollo/client'
import React, { useState } from 'react'
import {graphql, compose} from 'react-apollo'
import { ActivityIndicator, Text, View, ScrollView, RefreshControl, } from 'react-native'
import { ListItem, Button, Card, Icon} from 'react-native-elements'
import { currentUserQuery, getTournamentBuysQuery, createCostBuyMutation, deleteBuyMutation} from '../constants/GQL'
import { dictionaryLookup, sortEntryFees, totalItems } from '../utilities/functions'
// import Events from '../api/events'
// import Swipeout from 'react-native-swipeout'
import { AddButton, RemoveButton, ListHeader, } from '../components/FormComponents'
import { BannerAd } from '../components/Ads'
import { SwipeListView } from 'react-native-swipe-list-view'
// import {  } from '../components/ListHeader'

export default (() => {
  const { data, loading, error } = useQuery( getTournamentBuysQuery, { variables: { id: props.navigation.getParam('id')}})
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
  const [createCostBuy] = useMutation(createCostBuyMutation, {})
  const [deleteCostBuy] = useMutation(deleteBuyMutation, {})





  return(() => {
    if (loading || loadingUser) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (error || errorUser) {
    return <Text>Error! {error && error.message} {errorUser && errorUser.message}</Text>
    } else {
      const { user } = dataUser
      const userIsOwner = user.id === data.Tournament.user.id
    //   const { Tournament: {chips} } = data
    //   return (
    //     <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'white', }}>
    //       <SwipeListView
    //         refreshing={refreshingState}
    //         onRefresh={()=>{
    //           setRefreshingState(true)
    //           refetch().then(()=> 
    //             setRefreshingState(false)
    //           )
    //         }}
    //         data={sortChips(chips)}
    //         ListHeaderComponent={
    //           <ListHeader 
    //           title="Chips" 
    //           showAddButton={userIsOwner} 
    //           onAddButtonPress={addButtonPressed}
    //           />
    //         }
    //         rightOpenValue={-80}
    //         stickyHeaderIndices={[0]}
    //         disableRightSwipe = {true}
    //         swipeToOpenPercent = {10}
    //         swipeToClosePercent = {10}
    //         closeOnRowBeginSwipe = {true}
    //         closeOnRowOpen = {true}
    //         closeOnRowPress = {true}
    //         closeOnScroll = {true}
    //         renderItem={ (data, rowMap) => (
    //           <TouchableHighlight
    //             onPress={() => editButtonPressed(data.item.id)}
    //             style={[styles.rowFront,]}
    //             underlayColor={'#AAA'}
    //           >
    //             <View style={{flex: 1, flexDirection: 'row', }}>
    //               <View style={{flex: 0.4, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
    //                 <Text style={[styles.listItemTitle, styles.textBold, {color: dictionaryLookup(data.item.color, "ChipColorOptions", "short")}]}>
    //                   {dictionaryLookup(data.item.color, "ChipColorOptions", "long")}
    //                 </Text>
    //                 {/* <Text style={[styles.listItemSubtitle,]}>
    //                   {'Tournament value: ' + data.item.denom}
    //                 </Text> */}
    //               </View>
    //               <View style={{flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: responsiveFontSize(2)}}>
    //                 <Text style={[styles.listItemTitle, ]}>{'Tournament value: ' + data.item.denom}</Text>
    //               </View>
    //               <View style={{flex: 0.1, justifyContent: 'center', alignItems: 'center', }}>
    //                 <Icon
    //                   name='ios-arrow-forward'
    //                   color= 'black'
    //                   type='ionicon'
    //                 />
    //               </View>
    //             </View>
    //           </TouchableHighlight>
    //         )}
    //         renderHiddenItem={ (data, rowMap) => (
    //           <View style={styles.rowBack}>
    //             {/* <TouchableOpacity
    //                 style={[styles.backRightBtn, styles.backRightBtnLeft]}
    //                 onPress={() => copyButtonPressed(data.item.id)}
    //             >
    //                 <Text style={styles.backTextWhite}>C</Text>
    //             </TouchableOpacity> */}
    //             <TouchableOpacity
    //                 style={[styles.backRightBtn, styles.backRightBtnCenter]}
    //                 onPress={() => editButtonPressed(data.item.id)}
    //             >
    //               <Icon
    //                 name='edit'
    //                 color='white'
    //                 type='font-awesome'
    //               />
    //             </TouchableOpacity>
    //             <TouchableOpacity
    //                 style={[styles.backRightBtn, styles.backRightBtnRight]}
    //                 onPress={() => deleteButtonPressed(data.item)}
    //             >
    //               <Icon
    //                 name='ios-trash'
    //                 color='white'
    //                 type='ionicon'
    //               />
    //               {/* <Text style={styles.backTextWhite}>DEL</Text> */}
    //             </TouchableOpacity>
    //           </View>
    //         )}
    //       />
    //       <BannerAd />
    //     </View>
    //   )
    }
  }
)

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



// class BuyListScreen extends React.Component {

//   constructor(props) {
//     super(props)
//     this.state = {
//       user: null,
//       loading: false,
//     }
//   }

//   static navigationOptions = {
//   };

//   componentDidMount() {
//     this.setState({user: this.props.currentUserQuery.user})
//     this.refreshEventSubscription = Events.subscribe('RefreshCostList', () => this._onRefresh())
//   }

//   // componentWillReceiveProps = async (nextProps) => {
//   //   nextProps.getData.refetch()
//   //   nextProps.currentUserQuery.refetch()
//   // }

//   componentWillUnmount () {
//     this.refreshEventSubscription.remove()
//   }

//   _onRefresh = async () => {
//     await this.props.getData.refetch()
//   }

//   _search(searchText) {
//   }

  render() {
    const { getData: { loading: loadingData, error: errorData, Tournament } } = this.props
    const { currentUserQuery: { loading: loadingUser, error: errorUser, user}} = this.props
    if (loadingData || loadingUser) {
      return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
    } else if (errorData || errorUser) {
      return <Text>Error!</Text>
    } else {
      const userIsOwner = user.id === Tournament.user.id
      const list = sortEntryFees(Tournament.costs)
      return (
        <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
          <ListHeader 
            title="Entry Fee(s)" 
            loading={this.state.loading} 
          />
          <ScrollView 
            style={{flex: 1, marginLeft: 5, marginRight: 5}}
          >
            <View style={{flex: 1, }}>
              {
                list && list.map((item, i) => (

                  <Card
                    key={i}
                    title={item.costType && (dictionaryLookup(item.costType, "EntryFeeOptions", "long") + " ($" + item.price + ")")}
                    containerStyle={{marginBottom: 4}}
                  >
                    <View style={{flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                      <Text style={{flex: 2}}>
                        Count: {item.buys.length}{'\n'}
                        Cash In: {(item._buysMeta.count * item.price).toLocaleString(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'symbol', useGrouping: true})}{'\n'}
                        Chips Issued: {(item._buysMeta.count * item.chipStack).toLocaleString()}
                      </Text>
                      <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
                        <AddButton
                          mutation={this.props.createItem}
                          events={["RefreshCostList"]}
                          variables={{costId: item.id}}
                          containerStyle={{flex: 2}}
                        />
                        <RemoveButton 
                          mutation={this.props.deleteItem}
                          events={["RefreshCostList"]}
                          variables={{
                            id: (item._buysMeta.count > 0 && item.buys[item._buysMeta.count -1].id) || null,
                          }}
                          containerStyle={{flex: 2}}
                        />
                      </View>
                    </View>
                  </Card>
                ))
              }
            </View>
          </ScrollView>
          <BannerAd/>
        </View>
      )
    }
//   }
// }

// export default compose(
//   graphql(createCostBuyMutation, {name: 'createItem'}),
//   graphql(deleteBuyMutation, { name: 'deleteItem' }),
//   graphql(getTournamentBuysQuery, { name: 'getData', options: ({ navigation }) => ({ variables: { id: navigation.state.params.id } })}),
//   graphql(currentUserQuery, { name: 'currentUserQuery', }),
// )(BuyListScreen)