import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function StatusCard({ statusInfo }) {
  return (
    <View style={[styles.card, { borderLeftColor: statusInfo.color, backgroundColor: statusInfo.bg }]}>
      <Text style={styles.emoji}>{statusInfo.icon}</Text>
      <Text style={[styles.label, { color: statusInfo.color }]}>{statusInfo.label}</Text>
      <Text style={styles.eta}>{statusInfo.eta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderLeftWidth: 6,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  label: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  eta: { fontSize: 14, color: '#666' },
});