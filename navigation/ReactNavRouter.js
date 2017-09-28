import React from 'react'
import {TabNavigator, StackNavigator} from 'react-navigation'
import {Icon} from 'react-native-elements'

import Auth from '../components/Auth'

import HomeScreen from '../screens/HomeScreen'
import TournamentListScreen from '../screens/TournamentListScreen'
import TournamentTimerScreen from '../screens/TournamentTimerScreen'
import TournamentEditScreen from '../screens/TournamentEditScreen'
import SegmentListScreen from '../screens/SegmentListScreen'
import SegmentEditScreen from '../screens/SegmentEditScreen'
import ChipListScreen from '../screens/ChipListScreen'
import ChipEditScreen from '../screens/ChipEditScreen'
import CostListScreen from '../screens/CostListScreen'
import CostEditScreen from '../screens/CostEditScreen'
import ProfileScreen from '../screens/ProfileScreen'

export const TournamentsStack = StackNavigator({
	TournamentList: {
		screen: TournamentListScreen,
		navigationOptions: {
			title: 'Tournament List',
		}
	},
	Details: {
		screen: TournamentTimerScreen,
		navigationOptions: {

		}
	},
	Edit: {
		screen: TournamentEditScreen,
		navigationOptions: {
			title: 'Tourney Dashboard',
		}
	},
	SegmentList: {
		screen: SegmentListScreen,
		navigationOptions: {
			title: 'Blinds Schedule'
		}
	},
	SegmentEdit: {
		screen: SegmentEditScreen,
		navigationOptions: {
			title: 'Segment Editor',
		}
	},
	ChipList: {
		screen: ChipListScreen,
		navigationOptions: {
			title: 'Chip Schedule'
		}
	},
	ChipEdit: {
		screen: ChipEditScreen,
		navigationOptions: {
			title: 'Chip Editor',
		}
	},
	CostList: {
		screen: CostListScreen,
		navigationOptions: {
			title: 'Cost Schedule'
		}
	},
	CostEdit: {
		screen: CostEditScreen,
		navigationOptions: {
			title: 'Cost Editor',
		}
	},
}, 
{
	navigationOptions: {
	}
})

export const ProfileStack = StackNavigator({
	Profile: {
		screen: ProfileScreen,
		navigationOptions: {
			title: 'Profile'
		}
	}
})

export const Tabs = TabNavigator({
	Home: {
		screen: HomeScreen,
		navigationOptions: {
			title: 'Home',
			tabBarLabel: 'Home',
			tabBarIcon: ({tintColor}) => <Icon name="home" size={35} color={tintColor}/>,
		}
	},
	Tournaments: {
		screen: TournamentsStack,
		navigationOptions: {
			tabBarLabel: 'Tournaments',
			tabBarIcon: ({tintColor}) => <Icon name="list" size={35} color={tintColor}/>,
		}
	},
	Profile: {
		screen: ProfileStack,
		navigationOptions: {
			tabBarLabel: 'Me',
			tabBarIcon: ({tintColor}) => <Icon name="account-circle" size={35} color={tintColor}/>,
		}
	}
},
{
	initialRouteName: 'Tournaments',
}
)