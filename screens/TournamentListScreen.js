import { useQuery, useMutation} from '@apollo/client'
import React from 'react'
import { ActivityIndicator, Alert, View, ScrollView, RefreshControl, StyleSheet, } from 'react-native'
import { ListItem,  } from 'react-native-elements'
import { currentUserQuery, currentUserTournamentsQuery, createTournamentMutation, deleteTournamentMutation, getTournamentQuery, createTournamentFromExistingTournamentMutation} from '../constants/GQL' // copyTournamentMutation, 
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { ListHeader, } from '../components/FormComponents'
import { responsiveFontSize } from '../utilities/functions'
import { Ionicons } from '@expo/vector-icons'
import {useState} from 'react'

export default ((props) => {
	const [refreshingState, setRefreshingState] = useState(false)
	const [loadingState, setLoadingState] = useState(false)
	const {loading, data, error, client, refetch} = useQuery(currentUserTournamentsQuery)
	const [ deleteTournament ] = useMutation(deleteTournamentMutation, {})
	const [ createTournament ] = useMutation(createTournamentMutation, {})

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

						// console.log('Mutation response = \n\n' + JSON.stringify(mutationResponse))
						const { data: { createTournament }} = mutationResponse
						// Read the data from our cache for this query.
						const cacheData = cache.readQuery({ query: currentUserTournamentsQuery });
						cache.writeQuery({
							query: currentUserTournamentsQuery,
							data: {
								user: {
									...cacheData.user,
									tournaments: [
										...cacheData.user.tournaments,
										createTournament
									]
								}
							}
						})
					} catch (error) {
						console.log('error: ' + error.mesage)
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
    setLoadingState(true)
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
									// console.log('Mutation response = \n\n' + JSON.stringify(mutationResponse))
									const { data: { deleteTournament }} = mutationResponse
									// Read the data from our cache for this query.
									const cacheData = cache.readQuery({ query: currentUserTournamentsQuery })
									const existingTournaments = cacheData.user.tournaments
									const newTournaments = existingTournaments.filter(t => (t.id !== id))
									cache.writeQuery({
										query: currentUserTournamentsQuery,
										data: {
											user: {
												...cacheData.user,
												tournaments: 
													newTournaments
											}
										}
									})
								} catch (error) {
									console.log('error: ' + error.mesage)
								}
							}
						}
					)
				}
      ],
      { cancelable: false }
		)
		setLoadingState(false)
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


	return (
		<View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'white', }}>
			<ListHeader 
				title="Tournaments" 
				showAddButton={!loading && !error && !!data.user} 
				loading={loadingState} 
				onAddButtonPress={addButtonPressed}
				// onSearch={this._search}
			/>
			<ScrollView 
				style={{flex: 1, paddingLeft: 5, paddingRight: 5}}
				refreshControl={
					<RefreshControl
						refreshing={refreshingState}
						onRefresh={()=>refetch()}
					/>
				}
			>
				{loading && <ActivityIndicator/>}
				{!loading && data && data.user && data.user.tournaments.map((item, i) => (
					<Swipeout
						key={i}
						style={{ flex: 1 }}
						autoClose={true}
						right={[
							{
								text: 'Copy',
								onPress: copyButtonPressed,
								type: 'default'
							},
							{
								text: 'Edit',
								onPress: () => editButtonPressed(item.id),
								type: 'primary',
							},
							{
								text: 'DELETE',
								onPress: () => deleteButtonPressed(item.id, item.title),
								backgroundColor: '#ff0000',
								type: 'delete',
							},
						]}
					>
						<ListItem
							title={item.title}
							titleStyle={[ styles.listItemTitle, item.timer.active ? styles.active : {}]}
							subtitle={item.subtitle || ""}
							subtitleStyle={[ styles.listItemSubtitle, item.timer.active ? styles.active : {}]}
							onPress={() => {editButtonPressed(item.id)}}
							chevron
							bottomDivider
							rightIcon={item.timer.active && <Ionicons name="ios-timer"/>}
						/>
					</Swipeout>
					)
				)}
			</ScrollView>
			<BannerAd />
		</View>
	)
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
  }
});