import React from 'React'
import {TabNavigator, StackNavigator} from 'react-navigation'
import {Icon} from 'react-native-elements'
import {Text} from 'react-native';


import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TournamentListScreen from '../screens/TournamentListScreen';
import RootNavigation from './RootNavigation';
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';
import TournamentEditScreen from '../screens/TournamentEditScreen';
import ProfileScreen from '../screens/ProfileScreen'

import Auth from '../components/Auth';

export const TournamentsStack = StackNavigator({
	List: {
		screen: TournamentListScreen,
		navigationOptions: {
			title: 'Tournament List',
		}
	},
	Details: {
		screen: TournamentDetailsScreen,
		navigationOptions: {
			title: 'Timer',
		}
	},
	Edit: {
		screen: TournamentEditScreen,
		navigationOptions: {
			title: 'Editor',
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
	initialRouteName: 'Home',
}
)