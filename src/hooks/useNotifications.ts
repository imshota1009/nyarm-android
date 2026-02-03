/**
 * Nyarm - 通知管理フック
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Alarm } from '../types';

// 通知の表示設定
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

export const useNotifications = () => {
    const [permission, setPermission] = useState<string>('undetermined');
    const notificationListener = useRef<Notifications.EventSubscription>();
    const responseListener = useRef<Notifications.EventSubscription>();

    useEffect(() => {
        checkPermission();

        // 通知受信リスナー
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            console.log('通知受信:', notification);
        });

        // 通知タップリスナー
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log('通知タップ:', response);
        });

        return () => {
            if (notificationListener.current) {
                Notifications.removeNotificationSubscription(notificationListener.current);
            }
            if (responseListener.current) {
                Notifications.removeNotificationSubscription(responseListener.current);
            }
        };
    }, []);

    const checkPermission = async () => {
        if (!Device.isDevice) {
            setPermission('denied');
            return;
        }

        const { status } = await Notifications.getPermissionsAsync();
        setPermission(status);
    };

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!Device.isDevice) {
            return false;
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        setPermission(finalStatus);

        if (finalStatus !== 'granted') {
            return false;
        }

        // Android用のチャンネル設定
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('alarms', {
                name: 'アラーム',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF6B35',
                sound: 'default',
            });
        }

        return true;
    }, []);

    // アラーム通知をスケジュール
    const scheduleAlarm = useCallback(async (alarm: Alarm): Promise<string | null> => {
        if (permission !== 'granted') {
            const granted = await requestPermission();
            if (!granted) return null;
        }

        try {
            const [hours, minutes] = alarm.time.split(':').map(Number);
            const [year, month, day] = alarm.date.split('-').map(Number);

            const triggerDate = new Date(year, month - 1, day, hours, minutes, 0);

            // 過去の日時はスキップ
            if (triggerDate.getTime() <= Date.now()) {
                return null;
            }

            const notificationId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: '🐱 Nyarm アラーム',
                    body: alarm.label || 'アラームの時間です！',
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.MAX,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DATE,
                    date: triggerDate,
                },
            });

            return notificationId;
        } catch (error) {
            console.error('通知スケジュールエラー:', error);
            return null;
        }
    }, [permission, requestPermission]);

    // 全通知をキャンセル
    const cancelAllAlarms = useCallback(async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }, []);

    // 即座に通知を送る（テスト用）
    const sendTestNotification = useCallback(async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🐱 Nyarm テスト',
                body: 'テスト通知だニャ！',
                sound: true,
            },
            trigger: null, // 即時送信
        });
    }, []);

    return {
        permission,
        requestPermission,
        scheduleAlarm,
        cancelAllAlarms,
        sendTestNotification,
    };
};
