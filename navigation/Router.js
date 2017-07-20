import { createRouter } from '@expo/ex-navigation';

import HomeScreen from '../screens/HomeScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import TournamentListScreen from '../screens/TournamentListScreen';
import RootNavigation from './RootNavigation';
import TournamentDetailsScreen from '../screens/TournamentDetailsScreen';

export default createRouter(() => ({
  home: () => HomeScreen,
  links: () => LinksScreen,
  settings: () => SettingsScreen,
  tournamentList: () => TournamentListScreen,
  rootNavigation: () => RootNavigation,
  tournamentDetails: () => TournamentDetailsScreen,
}));
