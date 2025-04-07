import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import MainScreen from './components/MainScreen';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <MainScreen />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
});

export default App;
