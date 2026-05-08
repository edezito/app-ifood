import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DeliveryPIN({ pin }) {
  if (!pin) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>CÓDIGO DE ENTREGA</Text>
      <Text style={styles.code}>{String(pin).split('').join(' ')}</Text>
      <Text style={styles.hint}>Mostre ao entregador na entrega</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
  },
  label: {
    color: 'rgba(255,255,255,0.8)', fontSize: 12,
    fontWeight: '700', letterSpacing: 2, marginBottom: 12,
  },
  code: {
    color: '#fff', fontSize: 48, fontWeight: '900',
    letterSpacing: 10, fontFamily: 'monospace',
  },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 8 },
});