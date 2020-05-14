import React, {useState} from 'react'
import { ActivityIndicator, StyleSheet, Text, View, Button, AsyncStorage} from 'react-native'
import { useQuery, useMutation} from '@apollo/client'
import Auth from '../components/Auth'
import {currentUserQuery, 
  orphanedSegmentsQuery, deleteSegmentMutation, 
  orphanedChipsQuery, deleteChipMutation,
  orphanedCostsQuery, deleteCostMutation,
  orphanedTimersQuery, deleteTimerMutation,
  orphanedBuysQuery, deleteBuyMutation,
  orphanedPayoutLevelsQuery, deletePayoutLevelMutation,
} from '../constants/GQL'

export default ((props) => {
  const {data, loading, error, refetch, client} = useQuery(currentUserQuery)
  const {data: orphanedSegments, loading: loadingOrphanedSegments, refetch: refetchSegments} = useQuery(orphanedSegmentsQuery)
  const [deleteSegment] = useMutation(deleteSegmentMutation, {})
  const {data: orphanedChips, loading: loadingOrphanedChips, refetch: refetchChips} = useQuery(orphanedChipsQuery)
  const [deleteChip] = useMutation(deleteChipMutation, {})
  const {data: orphanedCosts, loading: loadingOrphanedCosts, refetch: refetchCosts} = useQuery(orphanedCostsQuery)
  const [deleteCost] = useMutation(deleteCostMutation, {})
  const {data: orphanedTimers, loading: loadingOrphanedTimers, refetch: refetchTimers} = useQuery(orphanedTimersQuery)
  const [deleteTimer] = useMutation(deleteTimerMutation, {})
  const {data: orphanedBuys, loading: loadingOrphanedBuys, refetch: refetchBuys} = useQuery(orphanedBuysQuery)
  const [deleteBuy] = useMutation(deleteBuyMutation, {})
  const {data: orphanedPayoutLevels, loading: loadingOrphanedPayoutLevels, refetch: refetchPayoutLevels} = useQuery(orphanedPayoutLevelsQuery)
  const [deletePayoutLevel] = useMutation(deletePayoutLevelMutation, {})
  
  const [timesPressed, setTimesPressed] = useState(0)
  

	const logout = async () => {
    await AsyncStorage.removeItem('token')
		client.resetStore()
  }
  
  const cleanupDB = async () => {
    await refetchSegments()
    await refetchChips()
    await refetchCosts()
    await refetchTimers()
    await refetchBuys()
    await refetchPayoutLevels()
    const { allSegments } = orphanedSegments
    const { allChips } = orphanedChips
    const { allCosts } = orphanedCosts
    const { allTimers } = orphanedTimers
    const { allBuys } = orphanedBuys
    const { allPayoutLevels } = orphanedPayoutLevels
    const totalOrphans = allSegments.length + allChips.length + allCosts.length + allTimers.length + allBuys.length
    const maxOrphans = Math.max(allSegments.length, allChips.length, allCosts.length, allTimers.length, allBuys.length)
    const maxItemsPerPress = 20
    const itemsPerPress = Math.min(maxItemsPerPress, maxOrphans)
    let itemsToDelete = null
    setTimesPressed(Math.ceil(maxOrphans/itemsPerPress))

    for (var i = 0; i < Math.ceil(maxOrphans/itemsPerPress); i++) {

      itemsToDelete = allSegments.slice(i * itemsPerPress, i * itemsPerPress + itemsPerPress)
      await itemsToDelete.forEach(element => {
        deleteSegment({
          variables: {id: element.id}
        })
      })
      itemsToDelete = allChips.slice(i * itemsPerPress, i * itemsPerPress + itemsPerPress)
      await itemsToDelete.forEach(element => {
        deleteChip({
          variables: {id: element.id}
        })
      })
      itemsToDelete = allCosts.slice(i * itemsPerPress, i * itemsPerPress + itemsPerPress)
      await itemsToDelete.forEach(element => {
        deleteCost({
          variables: {id: element.id}
        })
      })
      itemsToDelete = allTimers.slice(i * itemsPerPress, i * itemsPerPress + itemsPerPress)
      await itemsToDelete.forEach(element => {
        deleteTimer({
          variables: {id: element.id}
        })
      })
      itemsToDelete = allBuys.slice(i * itemsPerPress, i * itemsPerPress + itemsPerPress)
      await itemsToDelete.forEach(element => {
        deleteBuy({
          variables: {id: element.id}
        })
      })    
      itemsToDelete = allPayoutLevels.slice(i * itemsPerPress, i * itemsPerPress + itemsPerPress)
      await itemsToDelete.forEach(element => {
        deletePayoutLevel({
          variables: {id: element.id}
        })
      })
      setTimesPressed(i)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }
  }

  return(
    <View style={styles.container}>
      { loading || loadingOrphanedChips || loadingOrphanedCosts || loadingOrphanedSegments || loadingOrphanedTimers || loadingOrphanedBuys || loadingOrphanedPayoutLevels? <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator /></View>
        : error? <Text>`Error! ${error.message}`</Text>
          : !data.user? <Auth/>
            : <View style={styles.container}>
                <Text>Logged in as { data.user.name }</Text>
                <Text>You have { data.user.credits ? data.user.credits.toString() : '0' } credits.</Text>
                <Button onPress={logout} title={`Logout ${data.user.name}`}/>
                <Button onPress={cleanupDB} title="Cleanup Backend Database"/>
                <Text>{timesPressed}</Text>
              </View>
      }
    </View>
  )
})
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  }
})