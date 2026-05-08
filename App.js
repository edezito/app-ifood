import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

// Pega as credenciais do app.json -> extra
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

// ==================== Tela de Login ====================
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
      // ✅ CORRIGIDO: Removeu .single() e usa .limit(1) para evitar erro com emails duplicados
      const { data, error } = await supabase
        .from('clientes')
        .select('id, nome, email')
        .eq('email', email.trim())
        .limit(1);

      if (error) {
        console.error('Erro Supabase:', error);
        Alert.alert('Erro', 'Erro ao buscar usuário');
        return;
      }

      if (!data || data.length === 0) {
        Alert.alert('Erro', 'Email não encontrado');
        return;
      }

      // ✅ CORRIGIDO: Pega o primeiro cliente do array
      const cliente = data[0];
      console.log('✅ Login bem sucedido:', cliente.nome);

      // Notificações (apenas em dispositivo físico)
      if (Device.isDevice) {
        try {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status === 'granted') {
            const token = (await Notifications.getExpoPushTokenAsync()).data;
            await supabase.from('push_tokens').upsert({
              usuario_id: cliente.id,
              token: token,
              plataforma: 'android',
            });
          }
        } catch (notifError) {
          console.log('Notificações não disponíveis:', notifError);
        }
      }

      navigation.navigate('Acompanhamento', { usuario: cliente });
    } catch (err) {
      console.error('Erro no login:', err);
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
        <Text style={styles.subtitle}>Acompanhe seus pedidos</Text>

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
          <Text style={styles.buttonText}>
            {loading ? 'Entrando...' : 'Acompanhar Pedido'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ==================== Tela de Acompanhamento ====================
function AcompanhamentoScreen({ route }) {
  const { usuario } = route.params;
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buscarPedido();
    const interval = setInterval(buscarPedido, 30000);
    return () => clearInterval(interval);
  }, []);

  const buscarPedido = async () => {
    try {
      console.log('🔍 Buscando pedidos para:', usuario.id);
      
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('cliente_id', usuario.id)
        .order('criado_em', { ascending: false })
        .limit(1);

      console.log('📊 Resposta:', { 
        erro: error?.message, 
        temDados: !!data, 
        quantidade: data?.length 
      });

      if (error) {
        console.error('❌ Erro Supabase:', error);
        return;
      }

      if (data && data.length > 0) {
        console.log('✅ Pedido encontrado:', data[0].status);
        setPedido(data[0]);
      } else {
        console.log('⚠️ Nenhum pedido');
        setPedido(null);
      }
    } catch (err) {
      console.error('❌ Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Aguardando': '#3B82F6',
      'Em Preparação': '#F59E0B',
      'Em Trânsito': '#8B5CF6',
      'Entregue': '#10B981',
      'Cancelado': '#EF4444',
      'Confirmado': '#8B5CF6',
    };
    return colors[status] || '#6B7280';
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EA1D2C" />
        <Text style={styles.loadingText}>Carregando pedido...</Text>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.center}>
        <Text style={styles.emoji}>📦</Text>
        <Text style={styles.emptyText}>Nenhum pedido encontrado</Text>
        <Text style={styles.emptySubtext}>
          Faça um pedido pelo site e acompanhe aqui!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollContainer}>
      <StatusBar style="dark" />

      <View style={[styles.statusCard, { borderLeftColor: getStatusColor(pedido.status) }]}>
        <Text style={styles.statusTitle}>Status do Pedido</Text>
        <Text style={[styles.statusText, { color: getStatusColor(pedido.status) }]}>
          {pedido.status}
        </Text>
      </View>

      {pedido.pin_entrega && (
        <View style={styles.pinCard}>
          <Text style={styles.pinLabel}>CÓDIGO DE ENTREGA</Text>
          <Text style={styles.pinCode}>
            {String(pedido.pin_entrega).split('').join(' ')}
          </Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pedido</Text>
          <Text style={styles.infoValue}>
            #{String(pedido.id).slice(0, 8).toUpperCase()}
          </Text>
        </View>
        {pedido.total != null && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={styles.infoValue}>R$ {Number(pedido.total).toFixed(2)}</Text>
          </View>
        )}
        {pedido.forma_pagamento && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pagamento</Text>
            <Text style={styles.infoValue}>{pedido.forma_pagamento}</Text>
          </View>
        )}
        {pedido.tipo_entrega && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo de Entrega</Text>
            <Text style={styles.infoValue}>{pedido.tipo_entrega}</Text>
          </View>
        )}
        {pedido.endereco && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Endereço</Text>
            <Text style={styles.infoValue}>{pedido.endereco}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ==================== App Principal ====================
export default function App() {
  return (
    <NavigationContainer>
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
          name="Acompanhamento"
          component={AcompanhamentoScreen}
          options={{ title: 'Meu Pedido' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// ==================== Estilos ====================
const styles = StyleSheet.create({
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
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 48,
  },
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
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '900',
  },
  pinCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  pinLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
  },
  pinCode: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
    letterSpacing: 8,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
});