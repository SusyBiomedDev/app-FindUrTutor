import React from 'react';
import { StyleSheet, View } from 'react-native';
import MapView from 'react-native-maps';

export default function MapScreen() {

  return (
    <View style={styles.container}>

      <MapView
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: 38.7223,
          longitude: -9.1393,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },
});