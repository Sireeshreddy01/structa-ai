import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { config } from '../../config/index.js';
import { logger } from '../../config/logger.js';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Derives an encryption key from a password and salt
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return scryptSync(password, salt, KEY_LENGTH);
}

/**
 * Encrypts data using AES-256-GCM
 */
export function encrypt(data: Buffer | string, password?: string): Buffer {
  const secret = password || config.jwt.secret;
  
  // Generate random salt and IV
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  
  // Derive key
  const key = deriveKey(secret, salt);
  
  // Create cipher
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  // Encrypt
  const dataBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
  const encrypted = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);
  
  // Get auth tag
  const tag = cipher.getAuthTag();
  
  // Combine: salt + iv + tag + encrypted
  return Buffer.concat([salt, iv, tag, encrypted]);
}

/**
 * Decrypts data encrypted with encrypt()
 */
export function decrypt(encryptedData: Buffer, password?: string): Buffer {
  const secret = password || config.jwt.secret;
  
  // Extract components
  const salt = encryptedData.subarray(0, SALT_LENGTH);
  const iv = encryptedData.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = encryptedData.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = encryptedData.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  // Derive key
  const key = deriveKey(secret, salt);
  
  // Create decipher
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  // Decrypt
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Encrypts a string and returns base64 encoded result
 */
export function encryptString(text: string, password?: string): string {
  const encrypted = encrypt(text, password);
  return encrypted.toString('base64');
}

/**
 * Decrypts a base64 encoded encrypted string
 */
export function decryptString(encryptedBase64: string, password?: string): string {
  const encrypted = Buffer.from(encryptedBase64, 'base64');
  const decrypted = decrypt(encrypted, password);
  return decrypted.toString('utf-8');
}

/**
 * Generates a random secure token
 */
export function generateSecureToken(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data for logging (one-way)
 */
export function hashForLogging(data: string): string {
  const hash = scryptSync(data, 'log-salt', 16);
  return hash.toString('hex').substring(0, 8);
}

/**
 * Secure file encryption for stored documents
 */
export class SecureFileStorage {
  private password: string;
  
  constructor(password?: string) {
    this.password = password || config.jwt.secret;
  }
  
  /**
   * Encrypt file content
   */
  encryptFile(content: Buffer): Buffer {
    logger.debug('Encrypting file', { size: content.length });
    return encrypt(content, this.password);
  }
  
  /**
   * Decrypt file content
   */
  decryptFile(encryptedContent: Buffer): Buffer {
    logger.debug('Decrypting file', { size: encryptedContent.length });
    return decrypt(encryptedContent, this.password);
  }
  
  /**
   * Generate unique file key for per-file encryption
   */
  generateFileKey(): string {
    return generateSecureToken(32);
  }
}

export const secureFileStorage = new SecureFileStorage();
