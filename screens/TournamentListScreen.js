import { useApolloClient, useQuery, useMutation} from '@apollo/client'
import React from 'react'
import { ActivityIndicator, Alert, Text, View, ScrollView, RefreshControl, StyleSheet, Modal, TouchableHighlight, Linking, AsyncStorage, List } from 'react-native'
import { ListItem, Button } from 'react-native-elements'
import { currentUserQuery, currentUserTournamentsQuery, createTournamentMutation, deleteTournamentMutation, getTournamentQuery, createTournamentFromExistingTournamentMutation} from '../constants/GQL' // copyTournamentMutation, 
import Events from '../api/events'
import Swipeout from 'react-native-swipeout'
import { BannerAd } from '../components/Ads'
import { ListHeader, } from '../components/FormComponents'
import { AdMobRewarded, } from 'expo-ads-admob'
import { convertItemToInputType, responsiveFontSize } from '../utilities/functions'
import { Ionicons } from '@expo/vector-icons'
import {useState} from 'react'

export default ((props) => {
	const [refreshingState, setRefreshingState] = useState(false)
	const [loadingState, setLoadingState] = useState(false)
	const {loading, data, error, client, refetch} = useQuery(currentUserTournamentsQuery)
	const [ deleteTournament ] = useMutation(deleteTournamentMutation, {})
	const [ createTournament ] = useMutation(createTournamentMutation, {})

  addButtonPressed = async () => {
		setLoadingState(true)
		createTournament({variables: {"userId": data.user.id, "duration": undefined, title: undefined}}).then(()=>refetch())
		setLoadingState(false)
  }

  editButtonPressed = (id) => {
		// alert('passing id=' + id)
    props.navigation.navigate('Edit', {id: id})
  }

	deleteButtonPressed = (id) => {
    setLoadingState(true)
    Alert.alert(
      "Confirm Delete",
      "Delete item with id = " + id + " ?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () => deleteTournament({variables: {id: id} }).then(()=> refetch())}
      ],
      { cancelable: false }
		)
		setLoadingState(false)
  }

  copyButtonPressed = (id) => {
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
								onPress: () => deleteButtonPressed(item.id),
								backgroundColor: '#ff0000',
								type: 'delete',
							},
						]}
					>
						<ListItem
							title={item.title}
							titleStyle={[ styles.listItemTitle, item.timer.active ? styles.active : {}]}
							subtitle={item.id}
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