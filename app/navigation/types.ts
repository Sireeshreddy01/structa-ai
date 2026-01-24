/**
 * Navigation types for Structa AI
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Document } from '../../domain/models';

export type RootStackParamList = {
  Onboarding: undefined;
  PreSignup: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Camera: undefined;
  Processing: { documentId: string };
  Result: { document: Document };
  DocumentList: undefined;
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type CameraScreenProps = NativeStackScreenProps<RootStackParamList, 'Camera'>;
export type ProcessingScreenProps = NativeStackScreenProps<RootStackParamList, 'Processing'>;
export type ResultScreenProps = NativeStackScreenProps<RootStackParamList, 'Result'>;
export type DocumentListScreenProps = NativeStackScreenProps<RootStackParamList, 'DocumentList'>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
