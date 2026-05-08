import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { STATUS_MAP } from '../constants/status';

export default function PedidoCard({ pedido, onPress }) {
  const statusStyle = STATUS_MAP[pedido.status] || STATUS_MAP['Aguardando'];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.id}>#{String(pedido.id).slice(0, 8).toUpperCase()}</Text>
        <Text style={styles.total}>R$ {Number(pedido.total).toFixed(2)}</Text>
        <Text style={styles.data}>{new Date(pedido.criado_em).toLocaleDateString('pt-BR')}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
        <Text style={styles.icon}>{statusStyle.icon}</Text>
        <Text style={[styles.status, { color: statusStyle.color }]}>{pedido.status}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  left: { flex: 1 },
  id: { fontSize: 14, fontWeight: '700', color: '#333' },
  total: { fontSize: 16, fontWeight: '800', color: '#EA1D2C', marginTop: 4 },
  data: { fontSize: 12, color: '#999', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  icon: { fontSize: 14 },
  status: { fontSize: 12, fontWeight: '700' },
  arrow: { fontSize: 24, color: '#CCC', marginLeft: 8 },
});