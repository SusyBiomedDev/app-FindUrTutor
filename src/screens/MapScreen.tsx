import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView from 'react-native-maps';



export default function MapScreen() {

  

  return (
    <View style={styles.container}>

     
      
      
      <MapView
        style={styles.map}
        region={{
          latitude: 38.7223,
          longitude: -9.1393,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});