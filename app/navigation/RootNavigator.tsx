/**
 * Root Navigator for Structa AI
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { apiClient } from '../../infra/api/client';

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { CameraScreen } from '../screens/CameraScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OnboardingFlow } from '../screens/onboarding';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await apiClient.getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0a0a' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Onboarding"
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
      {/* Onboarding Flow - Swipeable */}
      <Stack.Screen
        name="Onboarding"
        options={{ headerShown: false }}
      >
        {(props) => (
          <OnboardingFlow
            onComplete={() => props.navigation.navigate('Login')}
            onSkip={() => props.navigation.navigate('Login')}
          />
        )}
      </Stack.Screen>

      {!isAuthenticated ? (
        <>
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {(props) => (
              <LoginScreen
                onLoginSuccess={() => setIsAuthenticated(true)}
                onNavigateToRegister={() => props.navigation.navigate('Register')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="Register"
            options={{ headerShown: false }}
          >
            {(props) => (
              <RegisterScreen
                onRegisterSuccess={() => setIsAuthenticated(true)}
                onNavigateToLogin={() => props.navigation.navigate('Login')}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        <>
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
        </>
      )}
    </Stack.Navigator>
  );
}
