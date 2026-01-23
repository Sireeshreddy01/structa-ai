/**
 * Permission Gate Component
 * Wraps screens that require specific permissions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { usePermissions, PermissionType } from '../../infra/permissions';

interface PermissionGateProps {
  permissions: PermissionType[];
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function PermissionGate({
  permissions,
  children,
  title = 'Permission Required',
  description = 'This feature requires additional permissions to work.',
}: PermissionGateProps) {
  const { permissions: permState, isLoading, requestPermission, openSettings } =
    usePermissions();

  const allGranted = permissions.every(
    (p) => permState[p] === 'granted' || permState[p] === 'limited'
  );

  const handleRequestAll = async () => {
    for (const permission of permissions) {
      await requestPermission(permission);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4cc9f0" />
        <Text style={styles.loadingText}>Checking permissions...</Text>
      </View>
    );
  }

  if (allGranted) {
    return <>{children}</>;
  }

  const deniedPermissions = permissions.filter(
    (p) => permState[p] === 'denied'
  );

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.permissionList}>
        {permissions.map((p) => (
          <View key={p} style={styles.permissionItem}>
            <Text style={styles.permissionIcon}>
              {permState[p] === 'granted' || permState[p] === 'limited'
                ? '✅'
                : permState[p] === 'denied'
                ? '❌'
                : '⏳'}
            </Text>
            <Text style={styles.permissionName}>{formatPermissionName(p)}</Text>
          </View>
        ))}
      </View>

      {deniedPermissions.length > 0 ? (
        <TouchableOpacity style={styles.button} onPress={openSettings}>
          <Text style={styles.buttonText}>Open Settings</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleRequestAll}>
          <Text style={styles.buttonText}>Grant Permissions</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function formatPermissionName(permission: PermissionType): string {
  switch (permission) {
    case 'camera':
      return 'Camera Access';
    case 'mediaLibrary':
      return 'Media Library';
    case 'imagePicker':
      return 'Photo Picker';
    default:
      return permission;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#a0a0a0',
    fontSize: 16,
    marginTop: 16,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  permissionList: {
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  permissionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  permissionName: {
    fontSize: 16,
    color: '#fff',
  },
  button: {
    backgroundColor: '#4cc9f0',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
