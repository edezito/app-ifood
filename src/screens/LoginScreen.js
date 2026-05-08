import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabase';
import { registrarPushToken } from '../services/notifications';

export default function LoginScreen({ navigation }) {
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

      // Registrar token push
      await registrarPushToken(cliente.id);

      navigation.navigate('HistoricoPedidos', { usuario: cliente });
    } catch (err) {
      Alert.alert('Erro', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
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
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Ver Meus Pedidos</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EA1D2C' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 36, fontWeight: '900', color: '#fff', marginBottom: 8 },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 48 },
  input: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  button: { width: '100%', backgroundColor: '#2B1A1A', borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});