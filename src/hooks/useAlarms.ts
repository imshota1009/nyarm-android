/**
 * Nyarm - アラーム管理フック
 */

import { useState, useEffect, useCallback } from 'react';
import { storage } from '../utils/storage';
import { formatDateKey, generateId } from '../utils/date';
import { Alarm, AlarmExclusions } from '../types';

export const useAlarms = () => {
    const [alarms, setAlarms] = useState<Alarm[]>([]);
    const [loading, setLoading] = useState(true);

    // 初期読み込み
    useEffect(() => {
        loadAlarms();
    }, []);

    const loadAlarms = async () => {
        setLoading(true);
        const data = await storage.get<Alarm[]>('alarms');
        setAlarms(data || []);
        setLoading(false);
    };

    const saveAlarms = async (newAlarms: Alarm[]) => {
        setAlarms(newAlarms);
        await storage.set('alarms', newAlarms);
    };

    // アラーム一括作成
    const createAlarms = useCallback(async (
        dates: Date[],
        time: string,
        label: string,
        exclusions: AlarmExclusions
    ): Promise<number> => {
        const newAlarms: Alarm[] = [];

        dates.forEach(date => {
            const dayOfWeek = date.getDay();

            // 除外設定をチェック
            if (exclusions.sunday && dayOfWeek === 0) return;
            if (exclusions.saturday && dayOfWeek === 6) return;

            const dateKey = formatDateKey(date);

            // 既存の同時刻アラームを除外して新規追加
            const alarm: Alarm = {
                id: generateId(),
                date: dateKey,
                time,
                label,
                enabled: true,
                createdAt: Date.now(),
            };

            newAlarms.push(alarm);
        });

        // 既存アラームから重複を削除して新規追加
        const updatedAlarms = [
            ...alarms.filter(a => !newAlarms.some(n => n.date === a.date && n.time === a.time)),
            ...newAlarms,
        ];

        await saveAlarms(updatedAlarms);
        return newAlarms.length;
    }, [alarms]);

    // 特定日のアラーム取得
    const getAlarmsForDate = useCallback((date: Date): Alarm[] => {
        const dateKey = formatDateKey(date);
        return alarms
            .filter(a => a.date === dateKey)
            .sort((a, b) => a.time.localeCompare(b.time));
    }, [alarms]);

    // アラーム有無チェック
    const hasAlarmOnDate = useCallback((date: Date): boolean => {
        const dateKey = formatDateKey(date);
        return alarms.some(a => a.date === dateKey && a.enabled);
    }, [alarms]);

    // アラームトグル
    const toggleAlarm = useCallback(async (id: string) => {
        const updatedAlarms = alarms.map(a =>
            a.id === id ? { ...a, enabled: !a.enabled } : a
        );
        await saveAlarms(updatedAlarms);
    }, [alarms]);

    // アラーム削除
    const deleteAlarm = useCallback(async (id: string) => {
        const updatedAlarms = alarms.filter(a => a.id !== id);
        await saveAlarms(updatedAlarms);
    }, [alarms]);

    // 今日のアラーム取得
    const getTodayAlarms = useCallback((): Alarm[] => {
        return getAlarmsForDate(new Date());
    }, [getAlarmsForDate]);

    return {
        alarms,
        loading,
        createAlarms,
        getAlarmsForDate,
        hasAlarmOnDate,
        toggleAlarm,
        deleteAlarm,
        getTodayAlarms,
        reload: loadAlarms,
    };
};
