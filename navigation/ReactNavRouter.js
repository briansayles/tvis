import React from 'react'
import {createBottomTabNavigator, createStackNavigator} from 'react-navigation'
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
import ContactListScreen from '../screens/ContactListScreen'
import GeneralInfoEditScreen from '../screens/GeneralInfoEditScreen'
import CostListScreen from '../screens/CostListScreen'
import CostEditScreen from '../screens/CostEditScreen'
import BuyListScreen from '../screens/BuyListScreen'
import ProfileScreen from '../screens/ProfileScreen'
import PayoutLevelListScreen from '../screens/PayoutLevelListScreen'
import TimerEditScreen from '../screens/TimerEditScreen'

export const TournamentsStack = createStackNavigator({
	TournamentList: {
		screen: TournamentListScreen,
		navigationOptions: {
			title: 'TourneyVision'
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
	TimerEdit: {
		screen: TimerEditScreen,
		navigationOptions: {
			title: 'Timer Editor'
		}
	},
	SegmentList: {
		screen: SegmentListScreen,
		navigationOptions: {
			title: 'TourneyVision'
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
			title: 'TourneyVision'
		}
	},
	ChipEdit: {
		screen: ChipEditScreen,
		navigationOptions: {
			title: 'Chip Editor',
		}
	},
	GeneralInfoEdit: {
		screen: GeneralInfoEditScreen,
		navigationOptions: {
			title: 'General Info',
		}
	},
	CostList: {
		screen: CostListScreen,
		navigationOptions: {
			title: 'TourneyVision'
		}
	},
	CostEdit: {
		screen: CostEditScreen,
		navigationOptions: {
			title: 'Entry Fee Editor',
		}
	},
	BuyList: {
		screen: BuyListScreen,
		navigationOptions: {
			title: 'Buyins'
		}
	},
	PayoutSetup: {
		screen: PayoutLevelListScreen,
		navigationOptions: {
			title: 'Payout Setup'
		}
	},
}, 
{
  	mode: 'modal',
  	headerMode: 'screen',
  	navigationOptions: {
	}
})

export const ProfileStack = createStackNavigator({
	Profile: {
		screen: ProfileScreen,
		navigationOptions: {
			title: 'Profile'
		}
	}
})

export const ContactsStack = createStackNavigator({
	Contacts: {
		screen: ContactListScreen,
		navigationOptions: {
			title: 'Contacts'
		}
	}
})

export const Tabs = createBottomTabNavigator({
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
	Contacts: {
		screen: ContactsStack,
		navigationOptions: {
			tabBarLabel: 'Contacts',
			tabBarIcon: ({tintColor}) => <Icon name="group" size={35} color={tintColor}/>,
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