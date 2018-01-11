import { StyleSheet } from 'react-native';
import dict from './Dictionary';

export default {
  error: StyleSheet.create({
    container: {
      backgroundColor: dict.errorBackground,
    },
    text: {
      color: dict.errorText,
    },
  }),

  warning: StyleSheet.create({
    container: {
      backgroundColor: dict.warningBackground,
    },
    text: {
      color: dict.warningText,
    },
  }),

  notice: StyleSheet.create({
    container: {
      backgroundColor: dict.noticeBackground,
    },
    text: {
      color: dict.noticeText,
    },
  }),
};
