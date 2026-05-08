import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrderSummary({ pedido, itens }) {
  return (
    <View>
      <View style={styles.infoCard}>
        <InfoRow label="Pagamento" value={pedido.forma_pagamento || 'Não informado'} />
        <InfoRow label="Tipo" value={pedido.tipo_entrega || 'Entrega'} />
        {pedido.endereco && <InfoRow label="Endereço" value={pedido.endereco} />}
        {pedido.cliente_nome && <InfoRow label="Cliente" value={pedido.cliente_nome} />}
      </View>

      <View style={styles.itensCard}>
        <Text style={styles.title}>Itens do Pedido</Text>
        {itens.length === 0 ? (
          <Text style={styles.noItems}>Nenhum item encontrado</Text>
        ) : (
          itens.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemQtd}>{item.quantidade}×</Text>
                <Text style={styles.itemNome}>{item.produtos?.nome || 'Produto'}</Text>
              </View>
              <Text style={styles.itemPreco}>
                R$ {(item.preco_unitario * item.quantidade).toFixed(2)}
              </Text>
            </View>
          ))
        )}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>R$ {Number(pedido.total).toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 1, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoLabel: { fontSize: 14, color: '#666' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1, textAlign: 'right' },
  itensCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 1 },
  title: { fontSize: 14, fontWeight: '700', color: '#666', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  noItems: { textAlign: 'center', color: '#999', paddingVertical: 20 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  itemQtd: { fontSize: 12, fontWeight: '700', color: '#EA1D2C', backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  itemNome: { fontSize: 14, fontWeight: '500', color: '#333' },
  itemPreco: { fontSize: 14, fontWeight: '600', color: '#333' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, marginTop: 8, borderTopWidth: 2, borderTopColor: '#E5E7EB' },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#666' },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#EA1D2C' },
});