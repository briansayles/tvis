import { useQuery, useMutation} from '@apollo/client'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, View, StyleSheet, Text, TouchableOpacity, TouchableHighlight} from 'react-native'
import { Icon, } from 'react-native-elements'
import { currentUserQuery, currentUserTournamentsQuery, createTournamentMutation, deleteTournamentMutation, createTournamentFromExistingTournamentMutation} from '../constants/GQL' // copyTournamentMutation, 
import { SwipeListView } from 'react-native-swipe-list-view'
import { BannerAd } from '../components/Ads'
import { ListHeader, } from '../components/FormComponents'
import { responsiveFontSize } from '../utilities/functions'

export default ((props) => {
	const [refreshingState, setRefreshingState] = useState(false)
	const {loading, data, error, refetch} = useQuery(currentUserTournamentsQuery)
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
	const [ deleteTournament ] = useMutation(deleteTournamentMutation, {})
	const [ createTournament ] = useMutation(createTournamentMutation, {})


  navigateToTimerButtonPressed = (id) => {
    props.navigation.navigate('Details', {id: id})
  }

	addButtonPressed = async () => {
		createTournament(
			{
				variables: {"userId": data.user.id, "duration": undefined, "title": "My Tournament #" + (data.user.tournaments.length + 1)},

				optimisticResponse: {
					createTournament: {
						__typename: "Tournament",
						id: "tbd",
						title: "Creating your tournament...",
						subtitle: "Server is working on it. Just a sec.",
						updatedAt: new Date(),
						childrenUpdatedAt: null,
						timer: {
							id: "tbd",
							__typename: "Timer",
							active: false,
						}
					}
				},
				update: (cache, mutationResponse) => {
					try {
						const { data: { createTournament }} = mutationResponse
						let cacheData = cache.readQuery({ 
							query: currentUserTournamentsQuery,
							variables: {},
						});
						cacheData = {
							user: {
								...cacheData.user,
								tournaments: [
									...cacheData.user.tournaments,
									createTournament
								]
							}							
						}
						cache.writeQuery({
							query: currentUserTournamentsQuery,
							variables: {},
							data: cacheData,
						})
					} catch (error) {
						console.log('error: ' + error.message)
					}
				}
			}
		)
	}

  editButtonPressed = (id) => {
		if (id==="tbd") {return}
		props.navigation.navigate('Edit', {id: id})
  }

	deleteButtonPressed = (id, title) => {
		if (id==="tbd") {return}
    Alert.alert(
      "Confirm Delete",
      "Delete: \n" + title + " ?",
      [
        {
          text: "Cancel",
          onPress: () => {},
          style: "cancel"
        },
				{ text: "OK", onPress: () => 
				
					deleteTournament(
						{
							variables: {id: id},
							optimisticResponse: {
								deleteTournament: {
									__typename: "Tournament",
									id: id,
								}
							},
							update: (cache, mutationResponse) => {
								try {
									const { data: { deleteTournament }} = mutationResponse
									let cacheData = cache.readQuery({ 
										query: currentUserTournamentsQuery,
										variables: {},
									})
									cacheData = {
										user: {
											...cacheData.user,
											tournaments: 
												cacheData.user.tournaments.filter(i => (i.id !== deleteTournament.id))
										}
									}
									cache.writeQuery({
										query: currentUserTournamentsQuery,
										variables: {},
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

  copyButtonPressed = (id) => {
		if (id==="tbd") {return}
    // this.setState({loading: true})
    // const client = useApolloClient() //   const {client} = this.props
    // client.query({ query: getTournamentQuery, variables: {id: id} }).then((result) => {
    //   const {user, title, subtitle, comments, game, costs, chips, segments} = result.data.Tournament
    //   const userId = user.id
    //   const newTitle = "Copy of " + title
    //   const costsInput = costs.map((i, index) => {
    //     return convertItemToInputType (i, ["tournamentId", "buys", "_buysMeta"])
    //   })
    //   const chipsInput = chips.map((i, index) => {
    //     return convertItemToInputType (i, ["tournamentId"])
    //   })
    //   const segmentsInput = segments.map((i, index) => {
    //     return convertItemToInputType (i, ["tournamentId"])
    //   })
	
//       client.mutate({mutation: createTournamentFromExistingTournamentMutation, variables: {
//         userId: userId, title: newTitle, subtitle: subtitle, comments: comments, game: game, costs: costsInput, chips: chipsInput, segments: segmentsInput
//       }}).then((result) => {
//         Events.publish('RefreshTournamentList')
//         this._editButtonPressed(result.data.createTournament.id)
//       }).catch((error) => {
//         console.log(error.message)
//         this.setState({loading: false})
//       })
//     }).catch((error) => {
//       this.setState({loading: false})
//     })
   }

	if (loading || loadingUser) {
    return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
  } else if (error || errorUser) {
  return <Text>Error! {error && error.message} {errorUser && errorUser.message}</Text>
  } else {
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
					data={!!data.user && data.user.tournaments}
					ListHeaderComponent={
						<ListHeader 
						title="Tournaments" 
						showAddButton={!!data.user} 
						onAddButtonPress={addButtonPressed}
						/>
					}
					rightOpenValue={-120}
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
							onPress={() => {
								// rowMap[data.item.key].closeRow()	
								editButtonPressed(data.item.id)
							}}
							style={[styles.rowFront,]}
							underlayColor={'#AAA'}
						>
							<View style={{flex: 1, flexDirection: 'row'}}>
								<View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
									<Text style={[styles.listItemTitle, data.item.timer.active ? styles.active : {}]}>{data.item.title}</Text>
									<Text style={[styles.listItemSubtitle, data.item.timer.active ? styles.active : {}]}>{data.item.subtitle}</Text>
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
								style={[styles.backRightBtn, styles.backRightBtnLeft]}
								onPress={() => {
									// rowMap[data.item.key].closeRow()	
									navigateToTimerButtonPressed(data.item.id)
								}}
							>
								<Icon
									name='ios-timer'
									color='white'
									type='ionicon'
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.backRightBtn, styles.backRightBtnCenter]}
								onPress={() => {
									// rowMap[data.item.key].closeRow()	
									editButtonPressed(data.item.id)
								}}
							>
								<Icon
									name='edit'
									color='white'
									type='font-awesome'
								/>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.backRightBtn, styles.backRightBtnRight]}
								onPress={() => {
									// rowMap[data.item.key].closeRow()	
									deleteButtonPressed(data.item.id, data.item.title)
								}}
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
})

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