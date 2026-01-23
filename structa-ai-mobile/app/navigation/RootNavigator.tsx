/**
 * Root Navigator for Structa AI
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { ResultScreen } from '../screens/ResultScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1a1a2e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: '#16213e',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Structa AI' }}
      />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ title: 'Scan Document', headerShown: false }}
      />
      <Stack.Screen
        name="Processing"
        component={ProcessingScreen}
        options={{ title: 'Processing', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ title: 'Results' }}
      />
    </Stack.Navigator>
  );
}
