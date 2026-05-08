import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import HistoricoPedidosScreen from './src/screens/HistoricoPedidosScreen';
import AcompanhamentoScreen from './src/screens/AcompanhamentoScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HistoricoPedidos" component={HistoricoPedidosScreen} />
        <Stack.Screen name="Acompanhamento" component={AcompanhamentoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}