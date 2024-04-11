import * as React from 'react';
import { SafeAreaView, View, } from 'react-native';

import { styles, } from '../styles'

export function AppLayout(props) {
  return (
    <SafeAreaView style={[styles.container, {} ]}>
        {props.children}
    </SafeAreaView>
  );
}