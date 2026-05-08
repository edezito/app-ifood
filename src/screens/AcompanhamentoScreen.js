import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { supabase } from '../config/supabase';
import { STATUS_MAP, STATUS_PASSOS } from '../constants/status';
import ProgressBar from '../components/ProgressBar';
import StatusCard from '../components/StatusCard';
import ProgressTracker from '../components/ProgressTracker';
import DeliveryPIN from '../components/DeliveryPIN';
import SuccessCard from '../components/SuccessCard';
import OrderSummary from '../components/OrderSummary';

export default function AcompanhamentoScreen({ route, navigation }) {
  const { pedidoId } = route.params;
  const [pedido, setPedido] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracker');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const buscarPedido = useCallback(async () => {
    try {
      const { data: pedidoData } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();

      if (pedidoData) {
        setPedido(pedidoData);
        const { data: itensData } = await supabase
          .from('itens_pedido')
          .select('*, produtos(nome)')
          .eq('pedido_id', pedidoId);
        if (itensData) setItens(itensData);
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  }, [pedidoId]);

  useEffect(() => {
    buscarPedido();
    const interval = setInterval(buscarPedido, 15000);
    return () => clearInterval(interval);
  }, [buscarPedido]);

  if (loading || !pedido) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EA1D2C" />
        <Text style={styles.loadingText}>Carregando pedido...</Text>
      </View>
    );
  }

  const statusInfo = STATUS_MAP[pedido.status] || STATUS_MAP['Aguardando'];
  const indiceAtual = statusInfo.passo;
  const progresso = indiceAtual >= 0 ? ((indiceAtual + 1) / STATUS_PASSOS.length) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pedido #{String(pedido.id).slice(0, 8).toUpperCase()}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <ProgressBar progresso={progresso} color={statusInfo.color} />
          <StatusCard statusInfo={statusInfo} />

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, activeTab === 'tracker' && styles.tabActive]} onPress={() => setActiveTab('tracker')}>
              <Text style={[styles.tabText, activeTab === 'tracker' && styles.tabTextActive]}>Rastreamento</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === 'resumo' && styles.tabActive]} onPress={() => setActiveTab('resumo')}>
              <Text style={[styles.tabText, activeTab === 'resumo' && styles.tabTextActive]}>Resumo</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'tracker' ? (
            <View style={styles.tabContent}>
              <ProgressTracker indiceAtual={indiceAtual} status={pedido.status} />
              {pedido.status === 'Em Trânsito' && <DeliveryPIN pin={pedido.pin_entrega} />}
              {pedido.status === 'Entregue' && <SuccessCard />}
            </View>
          ) : (
            <OrderSummary pedido={pedido} itens={itens} />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F7F7' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  header: { backgroundColor: '#EA1D2C', padding: 16, paddingTop: 50, flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  backText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
  scroll: { flex: 1, padding: 16 },
  tabs: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 12, padding: 4, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#333' },
  tabContent: { gap: 16 },
});