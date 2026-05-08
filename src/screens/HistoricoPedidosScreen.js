import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { supabase } from '../config/supabase';
import PedidoCard from '../components/PedidoCard';

export default function HistoricoPedidosScreen({ route, navigation }) {
  const { usuario } = route.params;
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const buscarPedidos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('cliente_id', usuario.id)
        .order('criado_em', { ascending: false });

      if (!error && data) setPedidos(data);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuario.id]);

  useEffect(() => { buscarPedidos(); }, [buscarPedidos]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EA1D2C" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pedidos</Text>
        <Text style={styles.subtitle}>{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}</Text>
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); buscarPedidos(); }} colors={['#EA1D2C']} />}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PedidoCard
              pedido={item}
              onPress={() => navigation.navigate('Acompanhamento', { pedidoId: item.id, usuario })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F7' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  header: { backgroundColor: '#EA1D2C', padding: 24, paddingTop: 60, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: '900', color: '#fff' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  list: { padding: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333' },
});