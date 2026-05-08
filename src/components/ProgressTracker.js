import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_PASSOS } from '../constants/status';

export default function ProgressTracker({ indiceAtual, status }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Etapas do Pedido</Text>
      {STATUS_PASSOS.map((passo, index) => {
        const isCompleted = index < indiceAtual;
        const isActive = index === indiceAtual;
        const isCancelled = status === 'Cancelado' && index > indiceAtual;

        return (
          <View key={passo.key} style={styles.step}>
            <View style={styles.line}>
              <View style={[
                styles.dot,
                isCompleted && styles.dotCompleted,
                isActive && styles.dotActive,
                isCancelled && styles.dotCancelled,
              ]}>
                <Text style={styles.dotIcon}>
                  {isCompleted ? '✓' : isActive ? '●' : '○'}
                </Text>
              </View>
              {index < STATUS_PASSOS.length - 1 && (
                <View style={[
                  styles.connector,
                  isCompleted && styles.connectorCompleted,
                ]} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={[
                styles.label,
                isCompleted && styles.labelCompleted,
                isActive && styles.labelActive,
              ]}>{passo.label}</Text>
              <Text style={styles.hint}>{passo.hint}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 1,
  },
  title: {
    fontSize: 14, fontWeight: '700', color: '#666',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
  },
  step: { flexDirection: 'row', marginBottom: 8 },
  line: { alignItems: 'center', marginRight: 12 },
  dot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center',
  },
  dotCompleted: { backgroundColor: '#D1FAE5' },
  dotActive: {
    backgroundColor: '#EDE9FE', borderWidth: 3, borderColor: '#8B5CF6',
  },
  dotCancelled: { backgroundColor: '#FEE2E2' },
  dotIcon: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  connector: { width: 2, height: 40, backgroundColor: '#E5E7EB' },
  connectorCompleted: { backgroundColor: '#A7F3D0' },
  info: { flex: 1, paddingBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#999' },
  labelCompleted: { color: '#059669' },
  labelActive: { color: '#7C3AED', fontSize: 16 },
  hint: { fontSize: 12, color: '#999', marginTop: 2 },
});