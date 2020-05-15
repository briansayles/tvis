import React from 'react'
import { createAppContainer } from 'react-navigation'
import { createBottomTabNavigator } from 'react-navigation-tabs'
import { createStackNavigator } from 'react-navigation-stack'
import { Ionicons } from '@expo/vector-icons'
// import Auth from '../components/Auth'
import { responsiveFontSize } from '../utilities/functions'

import HomeScreen from '../screens/HomeScreen'
import TournamentListScreen from '../screens/TournamentListScreen'
import TournamentTimerScreen from '../screens/TournamentTimerScreen'
import TournamentDashboardScreen from '../screens/TournamentDashboardScreen'
// import SegmentListScreen from '../screens/SegmentListScreen'
import SegmentEditScreen from '../screens/SegmentEditScreen'
// import ChipListScreen from '../screens/ChipListScreen'
import ChipEditScreen from '../screens/ChipEditScreen'
// import ContactListScreen from '../screens/ContactListScreen'
import GeneralInfoEditScreen from '../screens/GeneralInfoEditScreen'
// import CostListScreen from '../screens/CostListScreen'
import CostEditScreen from '../screens/CostEditScreen'
import BuyListScreen from '../screens/BuyListScreen'
import ProfileScreen from '../screens/ProfileScreen'

import PayoutLevelListScreen from '../screens/PayoutLevelListScreen'
import TimerEditScreen from '../screens/TimerEditScreen'

const TournamentsStack = createStackNavigator({
	TournamentList: {
		screen: TournamentListScreen,
		navigationOptions: {
			title: 'My Tournaments'
		}
	},
	Details: {
		screen: TournamentTimerScreen,
		navigationOptions: {
			title: 'Timer'
		}
	},
	Edit: {
		screen: TournamentDashboardScreen,
		navigationOptions: {
			title: 'Tourney Dashboard',
		}
	},
	TimerEdit: {
		screen: TimerEditScreen,
		navigationOptions: {
			title: 'Timer Options'
		}
	},
	// SegmentList: {
	// 	screen: SegmentListScreen,
	// 	navigationOptions: {
	// 		title: 'TourneyVision'
	// 	}
	// },
	SegmentEdit: {
		screen: SegmentEditScreen,
		navigationOptions: {
			title: 'Segment Editor',
		}
	},
	// ChipList: {
	// 	screen: ChipListScreen,
	// 	navigationOptions: {
	// 		title: 'TourneyVision'
	// 	}
	// },
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
	// CostList: {
	// 	screen: CostListScreen,
	// 	navigationOptions: {
	// 		title: 'TourneyVision'
	// 	}
	// },
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

const ProfileStack = createStackNavigator({
	Profile: {
		screen: ProfileScreen,
		navigationOptions: {
			title: 'Profile'
		}
	}
})

// const ContactsStack = createStackNavigator({
// 	Contacts: {
// 		screen: ContactListScreen,
// 		navigationOptions: {
// 			title: 'Contacts'
// 		}
// 	}
// })

const TabNavigator = createBottomTabNavigator({
	Home: {
		screen: HomeScreen,
		navigationOptions: {
			title: 'Home',
			tabBarLabel: 'Home',
			tabBarIcon: ({tintColor}) => <Ionicons name="ios-home" size={responsiveFontSize(2.5)} color={tintColor}/>,
		}
	},
	Tournaments: {
		screen: TournamentsStack,
		navigationOptions: {
			tabBarLabel: 'Tournaments',
			tabBarIcon: ({tintColor}) => <Ionicons name="ios-list" size={responsiveFontSize(2.5)} color={tintColor}/>,
		}
	},
	// Contacts: {
	// 	screen: ContactsStack,
	// 	navigationOptions: {
	// 		tabBarLabel: 'Contacts',
	// 		tabBarIcon: ({tintColor}) => <Ionicons name="ios-contacts" size={responsiveFontSize(2.5)} color={tintColor}/>,
	// 	}
	// },
	Profile: {
		screen: ProfileStack,
		navigationOptions: {
			tabBarLabel: 'Me',
			tabBarIcon: ({tintColor}) => <Ionicons name="ios-settings" size={responsiveFontSize(2.5)} color={tintColor}/>,
		}
	}
},
{
	initialRouteName: 'Tournaments',
}
)

let Navigation = createAppContainer(TabNavigator)

export default () => <Navigation theme="light" />