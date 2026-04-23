import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export const LocationSwitch = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  return (
    <View style={styles.container}>
      <Switch
        trackColor={{ false: "#767577", true: "#6246ea" }}
        thumbColor={isEnabled ? "#fff" : "#f4f3f4"}
        onValueChange={() => setIsEnabled(!isEnabled)}
        value={isEnabled}
      />
      <Text style={styles.text}>Usar a minha localização</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  text: { marginLeft: 10, fontWeight: 'bold' }
});