import { getItem, removeItem, setItem } from '@/provider/kv'

const TokenKey = 'auth-token';

export type TokenType = string;

export const getToken = () => getItem<TokenType>(TokenKey);
export const removeToken = () => removeItem(TokenKey);
export const setToken = (value: TokenType) => setItem<TokenType>(TokenKey, value);

