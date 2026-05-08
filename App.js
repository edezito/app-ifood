import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  FlatList,
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

// ==================== CONFIGURAÇÃO ====================
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL ou chave não encontradas em app.json -> extra');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const Stack = createNativeStackNavigator();

// ==================== MAPA DE STATUS ====================
const STATUS_MAP = {
  'Aguardando': {
    color: '#3B82F6',
    bg: '#EFF6FF',
    icon: '⏳',
    label: 'Aguardando Confirmação',
    eta: 'Em breve',
    passo: 0,
  },
  'Confirmado': {
    color: '#6366F1',
    bg: '#EEF2FF',
    icon: '✅',
    label: 'Pedido Confirmado',
    eta: 'Preparando',
    passo: 1,
  },
  'Em Preparação': {
    color: '#F59E0B',
    bg: '#FFFBEB',
    icon: '👨‍🍳',
    label: 'Em Preparação',
    eta: '~15-25 min',
    passo: 2,
  },
  'Em Trânsito': {
    color: '#8B5CF6',
    bg: '#F5F3FF',
    icon: '🛵',
    label: 'Saiu para Entrega',
    eta: '~5-15 min',
    passo: 3,
  },
  'Entregue': {
    color: '#10B981',
    bg: '#ECFDF5',
    icon: '✅',
    label: 'Pedido Entregue',
    eta: 'Finalizado',
    passo: 4,
  },
  'Cancelado': {
    color: '#EF4444',
    bg: '#FEF2F2',
    icon: '❌',
    label: 'Pedido Cancelado',
    eta: '—',
    passo: -1,
  },
};

const STATUS_PASSOS = [
  { key: 'Aguardando', label: 'Pedido Recebido', hint: 'Aguardando confirmação do restaurante' },
  { key: 'Confirmado', label: 'Confirmado', hint: 'Restaurante confirmou seu pedido' },
  { key: 'Em Preparação', label: 'Preparando', hint: 'Seu pedido está sendo preparado' },
  { key: 'Em Trânsito', label: 'Saiu para Entrega', hint: 'Entregador a caminho' },
  { key: 'Entregue', label: 'Entregue', hint: 'Pedido entregue com sucesso' },
];

// ==================== TELA DE LOGIN ====================
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Erro', 'Digite seu email');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, email, telefone, endereco')
        .eq('email', email.trim());

      if (error) {
        Alert.alert('Erro', 'Erro ao buscar usuário');
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert('Erro', 'Email não encontrado');
        return;
      }

      // Se múltiplos clientes, pega o que tem pedidos
      let cliente = data[0];
      if (data.length > 1) {
        for (const c of data) {
          const { data: pedidos } = await supabase
            .from('pedidos')
            .select('id')
            .eq('cliente_id', c.id)
            .limit(1);
          if (pedidos && pedidos.length > 0) {
            cliente = c;
            break;
          }
        }
      }

      navigation.navigate('HistoricoPedidos', { usuario: cliente });
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContent}>
        <Text style={styles.emoji}>🍔</Text>
        <Text style={styles.title}>FoodExpress</Text>
        <Text style={styles.subtitle}>Acompanhe seus pedidos em tempo real</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ver Meus Pedidos</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==================== TELA DE HISTÓRICO DE PEDIDOS ====================
function HistoricoPedidosScreen({ route, navigation }) {
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

      if (!error && data) {
        setPedidos(data);
      }
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [usuario.id]);

  useEffect(() => {
    buscarPedidos();
  }, [buscarPedidos]);

  const onRefresh = () => {
    setRefreshing(true);
    buscarPedidos();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EA1D2C" />
        <Text style={styles.loadingText}>Carregando pedidos...</Text>
      </View>
    );
  }

  const getStatusStyle = (status) => STATUS_MAP[status] || STATUS_MAP['Aguardando'];

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.historicoHeader}>
        <Text style={styles.historicoTitle}>Meus Pedidos</Text>
        <Text style={styles.historicoSubtitle}>
          {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} encontrado{pedidos.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {pedidos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📭</Text>
          <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
          <Text style={styles.emptySubtext}>Seus pedidos aparecerão aqui</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA1D2C']} />
          }
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const statusStyle = getStatusStyle(item.status);
            return (
              <TouchableOpacity
                style={styles.pedidoCard}
                onPress={() => navigation.navigate('Acompanhamento', { pedidoId: item.id, usuario })}
                activeOpacity={0.7}
              >
                <View style={styles.pedidoCardLeft}>
                  <Text style={styles.pedidoId}>#{String(item.id).slice(0, 8).toUpperCase()}</Text>
                  <Text style={styles.pedidoTotal}>R$ {Number(item.total).toFixed(2)}</Text>
                  <Text style={styles.pedidoData}>
                    {new Date(item.criado_em).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                  <Text style={[styles.statusIcon]}>{statusStyle.icon}</Text>
                  <Text style={[styles.statusText, { color: statusStyle.color }]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.arrowRight}>›</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

// ==================== TELA DE ACOMPANHAMENTO ====================
function AcompanhamentoScreen({ route, navigation }) {
  const { pedidoId, usuario } = route.params;
  const [pedido, setPedido] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracker');
  const fadeAnim = useState(new Animated.Value(0))[0];

  const buscarPedido = useCallback(async () => {
    try {
      // Buscar pedido
      const { data: pedidoData, error: pedidoError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single();

      if (!pedidoError && pedidoData) {
        setPedido(pedidoData);

        // Buscar itens do pedido
        const { data: itensData } = await supabase
          .from('itens_pedido')
          .select('*, produtos(nome)')
          .eq('pedido_id', pedidoId);

        if (itensData) {
          setItens(itensData);
        }
      }
    } catch (err) {
      console.error('Erro:', err);
    } finally {
      setLoading(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [pedidoId, fadeAnim]);

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
    <View style={styles.screenContainer}>
      {/* Header compacto */}
      <View style={styles.acompanhamentoHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.acompanhamentoTitle}>Pedido #{String(pedido.id).slice(0, 8).toUpperCase()}</Text>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Barra de Progresso */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progresso}%`, backgroundColor: statusInfo.color }]} />
            </View>
            <Text style={styles.progressText}>{Math.round(progresso)}% concluído</Text>
          </View>

          {/* Status Card */}
          <View style={[styles.statusCardLarge, { borderLeftColor: statusInfo.color, backgroundColor: statusInfo.bg }]}>
            <Text style={styles.statusEmoji}>{statusInfo.icon}</Text>
            <Text style={[styles.statusLabelLarge, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
            <Text style={styles.statusEta}>{statusInfo.eta}</Text>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'tracker' && styles.tabActive]}
              onPress={() => setActiveTab('tracker')}
            >
              <Text style={[styles.tabText, activeTab === 'tracker' && styles.tabTextActive]}>
                Rastreamento
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'resumo' && styles.tabActive]}
              onPress={() => setActiveTab('resumo')}
            >
              <Text style={[styles.tabText, activeTab === 'resumo' && styles.tabTextActive]}>
                Resumo
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo das Tabs */}
          {activeTab === 'tracker' ? (
            <View style={styles.tabContent}>
              {/* Progress Tracker */}
              <View style={styles.trackerCard}>
                <Text style={styles.sectionTitle}>Etapas do Pedido</Text>
                {STATUS_PASSOS.map((passo, index) => {
                  const isCompleted = index < indiceAtual;
                  const isActive = index === indiceAtual;
                  const isCancelled = pedido.status === 'Cancelado' && index > indiceAtual;

                  return (
                    <View key={passo.key} style={styles.trackerStep}>
                      <View style={styles.trackerLine}>
                        <View style={[
                          styles.trackerDot,
                          isCompleted && styles.trackerDotCompleted,
                          isActive && styles.trackerDotActive,
                          isCancelled && styles.trackerDotCancelled,
                        ]}>
                          <Text style={styles.trackerDotIcon}>
                            {isCompleted ? '✓' : isActive ? '●' : '○'}
                          </Text>
                        </View>
                        {index < STATUS_PASSOS.length - 1 && (
                          <View style={[
                            styles.trackerConnector,
                            isCompleted && styles.trackerConnectorCompleted,
                          ]} />
                        )}
                      </View>
                      <View style={styles.trackerInfo}>
                        <Text style={[
                          styles.trackerLabel,
                          isCompleted && styles.trackerLabelCompleted,
                          isActive && styles.trackerLabelActive,
                        ]}>
                          {passo.label}
                        </Text>
                        <Text style={styles.trackerHint}>{passo.hint}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* PIN de Entrega (quando em trânsito) */}
              {pedido.status === 'Em Trânsito' && pedido.pin_entrega && (
                <View style={styles.pinCardLarge}>
                  <Text style={styles.pinLabelLarge}>CÓDIGO DE ENTREGA</Text>
                  <Text style={styles.pinCodeLarge}>
                    {String(pedido.pin_entrega).split('').join(' ')}
                  </Text>
                  <Text style={styles.pinHint}>Mostre ao entregador na entrega</Text>
                </View>
              )}

              {/* Card de Sucesso (quando entregue) */}
              {pedido.status === 'Entregue' && (
                <View style={styles.successCard}>
                  <Text style={styles.successEmoji}>🎉</Text>
                  <Text style={styles.successTitle}>Pedido Entregue!</Text>
                  <Text style={styles.successText}>Bom apetite! 🍽️</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.tabContent}>
              {/* Resumo do Pedido */}
              {/* Informações */}
              <View style={styles.infoCardLarge}>
                <View style={styles.infoRowLarge}>
                  <Text style={styles.infoLabelLarge}>Pagamento</Text>
                  <Text style={styles.infoValueLarge}>{pedido.forma_pagamento || 'Não informado'}</Text>
                </View>
                <View style={styles.infoRowLarge}>
                  <Text style={styles.infoLabelLarge}>Tipo</Text>
                  <Text style={styles.infoValueLarge}>{pedido.tipo_entrega || 'Entrega'}</Text>
                </View>
                {pedido.endereco && (
                  <View style={styles.infoRowLarge}>
                    <Text style={styles.infoLabelLarge}>Endereço</Text>
                    <Text style={styles.infoValueLarge}>{pedido.endereco}</Text>
                  </View>
                )}
                {pedido.cliente_nome && (
                  <View style={styles.infoRowLarge}>
                    <Text style={styles.infoLabelLarge}>Cliente</Text>
                    <Text style={styles.infoValueLarge}>{pedido.cliente_nome}</Text>
                  </View>
                )}
              </View>

              {/* Itens do Pedido */}
              <View style={styles.itensCard}>
                <Text style={styles.sectionTitle}>Itens do Pedido</Text>
                {itens.length === 0 ? (
                  <Text style={styles.noItems}>Nenhum item encontrado</Text>
                ) : (
                  itens.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemQtd}>{item.quantidade}×</Text>
                        <Text style={styles.itemNome}>
                          {item.produtos?.nome || 'Produto'}
                        </Text>
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
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ==================== APP PRINCIPAL ====================
export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#EA1D2C' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HistoricoPedidos"
          component={HistoricoPedidosScreen}
          options={{ title: 'Meus Pedidos', headerShown: false }}
        />
        <Stack.Screen
          name="Acompanhamento"
          component={AcompanhamentoScreen}
          options={{ title: 'Acompanhar Pedido', headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==================== ESTILOS ====================
const styles = StyleSheet.create({
  // Telas
  screenContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },

  // Login
  container: {
    flex: 1,
    backgroundColor: '#EA1D2C',
  },
  loginContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 48 },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#2B1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Histórico
  historicoHeader: {
    backgroundColor: '#EA1D2C',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  historicoTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    fontFamily: 'System',
  },
  historicoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  pedidoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pedidoCardLeft: { flex: 1 },
  pedidoId: { fontSize: 14, fontWeight: '700', color: '#333' },
  pedidoTotal: { fontSize: 16, fontWeight: '800', color: '#EA1D2C', marginTop: 4 },
  pedidoData: { fontSize: 12, color: '#999', marginTop: 2 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusIcon: { fontSize: 14 },
  statusText: { fontSize: 12, fontWeight: '700' },
  arrowRight: { fontSize: 24, color: '#CCC', marginLeft: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#666', textAlign: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },

  // Acompanhamento
  acompanhamentoHeader: {
    backgroundColor: '#EA1D2C',
    padding: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  acompanhamentoTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },

  // Progresso
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },

  // Status Card
  statusCardLarge: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    borderLeftWidth: 6,
    alignItems: 'center',
  },
  statusEmoji: { fontSize: 48, marginBottom: 8 },
  statusLabelLarge: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statusEta: { fontSize: 14, color: '#666' },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#fff' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  tabTextActive: { color: '#333' },
  tabContent: { gap: 16 },

  // Tracker
  trackerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  trackerStep: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  trackerLine: {
    alignItems: 'center',
    marginRight: 12,
  },
  trackerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackerDotCompleted: { backgroundColor: '#D1FAE5' },
  trackerDotActive: {
    backgroundColor: '#EDE9FE',
    borderWidth: 3,
    borderColor: '#8B5CF6',
  },
  trackerDotCancelled: { backgroundColor: '#FEE2E2' },
  trackerDotIcon: { fontSize: 12, fontWeight: 'bold', color: '#666' },
  trackerConnector: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  trackerConnectorCompleted: { backgroundColor: '#A7F3D0' },
  trackerInfo: { flex: 1, paddingBottom: 16 },
  trackerLabel: { fontSize: 14, fontWeight: '600', color: '#999' },
  trackerLabelCompleted: { color: '#059669' },
  trackerLabelActive: { color: '#7C3AED', fontSize: 16 },
  trackerHint: { fontSize: 12, color: '#999', marginTop: 2 },

  // PIN
  pinCardLarge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
  },
  pinLabelLarge: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  pinCodeLarge: {
    color: '#fff',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 10,
    fontFamily: 'monospace',
  },
  pinHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
  },

  // Success
  successCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A7F3D0',
  },
  successEmoji: { fontSize: 48, marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#059669', marginBottom: 4 },
  successText: { fontSize: 16, color: '#059669' },

  // Resumo
  infoCardLarge: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 1,
  },
  infoRowLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabelLarge: { fontSize: 14, color: '#666' },
  infoValueLarge: { fontSize: 14, fontWeight: '600', color: '#333', flex: 1, textAlign: 'right' },

  // Itens
  itensCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 1,
  },
  noItems: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  itemQtd: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA1D2C',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  itemNome: { fontSize: 14, fontWeight: '500', color: '#333' },
  itemPreco: { fontSize: 14, fontWeight: '600', color: '#333' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#666' },
  totalValue: { fontSize: 24, fontWeight: '900', color: '#EA1D2C' },
});