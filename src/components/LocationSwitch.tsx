import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
};

export const LocationSwitch = ({ value, onChange }: Props) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <Switch
        trackColor={{ false: "#767577", true: colors.primary }}
        thumbColor={value ? "#fff" : "#f4f3f4"}
        onValueChange={onChange}
        value={value}
      />
      <Text style={styles.text}>Use my location to search</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  text: { marginLeft: 10, fontWeight: 'bold', color: '#fff' },
});