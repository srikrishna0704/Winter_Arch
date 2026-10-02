import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { PaperWinterTrackerScreen } from './screens/PaperWinterTrackerScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#090A0C" />
      <PaperWinterTrackerScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090A0C'
  }
});
