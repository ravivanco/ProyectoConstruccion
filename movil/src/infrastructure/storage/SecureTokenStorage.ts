import * as SecureStore from 'expo-secure-store';
import { TokenStorage } from '../../domain/repositories/AuthRepository';
const TOKEN_KEY = 'dk_fitt_access_token';
export class SecureTokenStorage implements TokenStorage { save(token: string) { return SecureStore.setItemAsync(TOKEN_KEY, token); } remove() { return SecureStore.deleteItemAsync(TOKEN_KEY); } }
