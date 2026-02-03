/**
 * Nyarm - ストレージユーティリティ
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = 'nyarm_';

export const storage = {
    async set<T>(key: string, value: T): Promise<void> {
        try {
            const serialized = JSON.stringify(value);
            await AsyncStorage.setItem(STORAGE_PREFIX + key, serialized);
        } catch (error) {
            console.error(`データの保存に失敗しました (${key}):`, error);
        }
    },

    async get<T>(key: string): Promise<T | null> {
        try {
            const serialized = await AsyncStorage.getItem(STORAGE_PREFIX + key);
            if (serialized === null) return null;
            return JSON.parse(serialized) as T;
        } catch (error) {
            console.error(`データの取得に失敗しました (${key}):`, error);
            return null;
        }
    },

    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_PREFIX + key);
        } catch (error) {
            console.error(`データの削除に失敗しました (${key}):`, error);
        }
    },

    async clear(): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const nyarmKeys = keys.filter(key => key.startsWith(STORAGE_PREFIX));
            await AsyncStorage.multiRemove(nyarmKeys);
        } catch (error) {
            console.error('データのクリアに失敗しました:', error);
        }
    },
};
