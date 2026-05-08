import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SuccessCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>🎉</Text>
      <Text style={styles.title}>Pedido Entregue!</Text>
      <Text style={styles.text}>Bom apetite! 🍽️</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ECFDF5', borderRadius: 20,
    padding: 32, alignItems: 'center',
    borderWidth: 2, borderColor: '#A7F3D0',
  },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '900', color: '#059669', marginBottom: 4 },
  text: { fontSize: 16, color: '#059669' },
});