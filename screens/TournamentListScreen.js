import { useQuery, useMutation} from '@apollo/client'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, View, StyleSheet, Text, TouchableOpacity, TouchableHighlight} from 'react-native'
import { Icon, ListItem, } from 'react-native-elements'
import { currentUserQuery, currentUserTournamentsQuery, createTournamentMutation, } from '../constants/GQL' // copyTournamentMutation, 
// import { SwipeListView } from 'react-native-swipe-list-view'
import { BannerAd } from '../components/Ads'
// import { ListHeader, } from '../components/FormComponents'
import { responsiveFontSize } from '../utilities/functions'
import Auth from '../components/Auth'

export default ((props) => {
	const [refreshingState, setRefreshingState] = useState(false)
	const {loading, data, error, refetch} = useQuery(currentUserTournamentsQuery)
  const {data: dataUser, loading: loadingUser, error: errorUser} = useQuery(currentUserQuery)
	const [ createTournament ] = useMutation(createTournamentMutation, {})

	const addTournamentButtonPressed = async () => {
		createTournament(
			{
				variables: {
					"userId": dataUser.user.id,
					"duration": undefined, 
					"title": "New Tournament"
				},
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
						if (createTournament.id !== "tbd") {props.navigation.navigate('Edit', {id: createTournament.id})}
					} catch (error) {
						console.log('error: ' + error.message)
					}
				}
			}
		)
	}

  const editTournamentButtonPressed = (id) => {
		if (id==="tbd") {return}
		props.navigation.navigate('Edit', {id: id})
  }

	if (loading || loadingUser) {
    return <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
  } else if (error || errorUser) {
  	return <Text>Error! {error && error.message} {errorUser && errorUser.message}</Text>
  } else {
		return (
			<View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'white', }}>
				<View style={{flexDirection: 'column', justifyContent: 'flex-start'}}>
					{ data.user && data.user.tournaments && data.user.tournaments.map((t)=> {
						return(
							<ListItem
								onPress={()=>{editTournamentButtonPressed(t.id)}}
								key={t.id}
								title={t.title}
								subtitle={t.subtitle}
								titleStyle={[styles.listItemTitle, ]}
								subtitleStyle={[styles.listItemSubtitle, ]}
								bottomDivider
							/>
						)			
					})}					
					{dataUser.user && 
						<TouchableHighlight onPress={() => addTournamentButtonPressed()}>
							<Icon name="ios-add" color="green" type="ionicon" size={responsiveFontSize(4)} />
						</TouchableHighlight>
					}
				</View>
				{!dataUser.user && <Auth/>}
				<BannerAd/>
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