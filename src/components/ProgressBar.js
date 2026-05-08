import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProgressBar({ progresso, color }) {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${progresso}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.text}>{Math.round(progresso)}% concluído</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  bar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  text: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
});