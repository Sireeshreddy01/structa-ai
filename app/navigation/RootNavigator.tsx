/**
 * Root Navigator for Structa AI
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CommonActions } from '@react-navigation/native';
import type { RootStackParamList } from './types';
import { apiClient } from '../../infra/api/client';

// Screens
import { HomeScreen } from '../screens/home';
import { ProfileScreen } from '../screens/profile';
import { LibraryScreen } from '../screens/library';
import { NotificationsPanel } from '../screens/notifications';
import { CameraScreen } from '../screens/CameraScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OnboardingFlow } from '../screens/onboarding';
import { PreSignupScreen } from '../screens/auth/PreSignupScreen';

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
      initialRouteName={isAuthenticated ? 'Home' : 'Onboarding'}
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
            onComplete={() => props.navigation.navigate('PreSignup')}
            onSkip={() => props.navigation.navigate('PreSignup')}
          />
        )}
      </Stack.Screen>

      {/* Pre-Signup Welcome Screen */}
      <Stack.Screen
        name="PreSignup"
        options={{ headerShown: false }}
      >
        {(props) => (
          <PreSignupScreen
            onProceed={() => {
              setIsAuthenticated(true);
              props.navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })
              );
            }}
            onSignIn={() => props.navigation.navigate('Login')}
          />
        )}
      </Stack.Screen>

      {/* Auth Screens - Always available */}
      <Stack.Screen
        name="Login"
        options={{ headerShown: false }}
      >
        {(props) => (
          <LoginScreen
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              props.navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })
              );
            }}
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
            onRegisterSuccess={() => {
              setIsAuthenticated(true);
              props.navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                })
              );
            }}
            onNavigateToLogin={() => props.navigation.navigate('Login')}
          />
        )}
      </Stack.Screen>

      {/* Main App Screens - Always defined, controlled by initialRouteName */}
      <Stack.Screen
        name="Home"
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      >  
        {(props) => (
          <HomeScreen
            onNavigateToCamera={() => props.navigation.navigate('Camera')}
            onNavigateToProfile={() => props.navigation.navigate('Profile')}
            onNavigateToLibrary={() => props.navigation.navigate('Library')}
            onNavigateToNotifications={() => props.navigation.navigate('Notifications')}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Profile"
        options={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        {(props) => (
          <ProfileScreen
            onNavigateToHome={() => props.navigation.navigate('Home')}
            onLogout={() => {
              setIsAuthenticated(false);
              props.navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Onboarding' }],
                })
              );
            }}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Library"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {(props) => (
          <LibraryScreen
            onBack={() => props.navigation.goBack()}
            onDocumentPress={(doc) => console.log('Open document:', doc.id)}
          />
        )}
      </Stack.Screen>
      <Stack.Screen
        name="Notifications"
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {(props) => (
          <NotificationsPanel
            onBack={() => props.navigation.goBack()}
          />
        )}
      </Stack.Screen>
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
