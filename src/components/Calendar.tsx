/**
 * Nyarm - カレンダーコンポーネント
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { formatDateKey, isSameDay } from '../utils/date';
import { CalendarDay } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_SIZE = (SCREEN_WIDTH - 64) / 7;

interface Props {
    selectedDates: Date[];
    onDatesChange: (dates: Date[]) => void;
    hasAlarmOnDate: (date: Date) => boolean;
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

export const Calendar: React.FC<Props> = ({
    selectedDates,
    onDatesChange,
    hasAlarmOnDate,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectionStart, setSelectionStart] = useState<Date | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // カレンダー日付を生成
    const days = useMemo((): CalendarDay[] => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        const result: CalendarDay[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 前月
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthLastDay - i);
            result.push({
                date,
                dateKey: formatDateKey(date),
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                hasAlarm: false,
                dayOfWeek: date.getDay(),
            });
        }

        // 今月
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            result.push({
                date,
                dateKey: formatDateKey(date),
                isCurrentMonth: true,
                isToday: isSameDay(date, today),
                isSelected: selectedDates.some(d => isSameDay(d, date)),
                hasAlarm: hasAlarmOnDate(date),
                dayOfWeek: date.getDay(),
            });
        }

        // 次月（6行分に調整）
        const remainingDays = 42 - result.length;
        for (let i = 1; i <= remainingDays; i++) {
            const date = new Date(year, month + 1, i);
            result.push({
                date,
                dateKey: formatDateKey(date),
                isCurrentMonth: false,
                isToday: false,
                isSelected: false,
                hasAlarm: false,
                dayOfWeek: date.getDay(),
            });
        }

        return result;
    }, [year, month, selectedDates, hasAlarmOnDate]);

    const goToPrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayPress = useCallback((day: CalendarDay) => {
        if (!day.isCurrentMonth) return;

        if (!selectionStart) {
            // 選択開始
            setSelectionStart(day.date);
            onDatesChange([day.date]);
        } else {
            // 選択終了 - 期間を作成
            const start = selectionStart;
            const end = day.date;
            const startTime = Math.min(start.getTime(), end.getTime());
            const endTime = Math.max(start.getTime(), end.getTime());

            const range: Date[] = [];
            let current = new Date(startTime);
            while (current.getTime() <= endTime) {
                range.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }

            onDatesChange(range);
            setSelectionStart(null);
        }
    }, [selectionStart, onDatesChange]);

    const clearSelection = () => {
        setSelectionStart(null);
        onDatesChange([]);
    };

    return (
        <View style={styles.container}>
            {/* ヘッダー */}
            <View style={styles.header}>
                <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
                    <Text style={styles.navButtonText}>◀</Text>
                </TouchableOpacity>
                <Text style={styles.title}>{year}年{month + 1}月</Text>
                <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                    <Text style={styles.navButtonText}>▶</Text>
                </TouchableOpacity>
            </View>

            {/* 曜日 */}
            <View style={styles.weekdays}>
                {WEEKDAYS.map((day, index) => (
                    <Text
                        key={day}
                        style={[
                            styles.weekday,
                            index === 0 && styles.sunday,
                            index === 6 && styles.saturday,
                        ]}
                    >
                        {day}
                    </Text>
                ))}
            </View>

            {/* 日付グリッド */}
            <View style={styles.grid}>
                {days.map((day, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.day,
                            !day.isCurrentMonth && styles.otherMonth,
                            day.isToday && styles.today,
                            day.isSelected && styles.selected,
                        ]}
                        onPress={() => handleDayPress(day)}
                        disabled={!day.isCurrentMonth}
                    >
                        <Text
                            style={[
                                styles.dayText,
                                !day.isCurrentMonth && styles.otherMonthText,
                                day.isToday && styles.todayText,
                                day.dayOfWeek === 0 && day.isCurrentMonth && styles.sundayText,
                                day.dayOfWeek === 6 && day.isCurrentMonth && styles.saturdayText,
                            ]}
                        >
                            {day.date.getDate()}
                        </Text>
                        {day.hasAlarm && <Text style={styles.alarmIcon}>🔔</Text>}
                    </TouchableOpacity>
                ))}
            </View>

            {/* 選択中の場合 */}
            {selectedDates.length > 0 && (
                <View style={styles.selectionInfo}>
                    <Text style={styles.selectionText}>
                        {selectedDates.length}日選択中
                        {selectionStart && ' (終了日をタップ)'}
                    </Text>
                    <TouchableOpacity onPress={clearSelection}>
                        <Text style={styles.clearText}>クリア</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ヒント */}
            <View style={styles.hint}>
                <Text style={styles.hintText}>💡 2回タップで期間を選択できます</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    navButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f4f4f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    navButtonText: {
        fontSize: 16,
        color: '#52525b',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#27272a',
    },
    weekdays: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    weekday: {
        width: DAY_SIZE,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '700',
        color: '#71717a',
    },
    sunday: {
        color: '#ef4444',
    },
    saturday: {
        color: '#3b82f6',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    day: {
        width: DAY_SIZE,
        height: DAY_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        backgroundColor: '#fafafa',
        marginBottom: 2,
    },
    otherMonth: {
        backgroundColor: 'transparent',
    },
    today: {
        backgroundColor: '#f97316',
    },
    selected: {
        backgroundColor: 'rgba(251, 146, 60, 0.3)',
        borderWidth: 2,
        borderColor: '#f97316',
    },
    dayText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3f3f46',
    },
    otherMonthText: {
        color: '#d4d4d8',
    },
    todayText: {
        color: '#fff',
        fontWeight: '800',
    },
    sundayText: {
        color: '#ef4444',
    },
    saturdayText: {
        color: '#3b82f6',
    },
    alarmIcon: {
        fontSize: 8,
        position: 'absolute',
        bottom: 2,
    },
    selectionInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f4f4f5',
    },
    selectionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f97316',
    },
    clearText: {
        fontSize: 14,
        color: '#71717a',
        textDecorationLine: 'underline',
    },
    hint: {
        marginTop: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff7ed',
        borderRadius: 8,
    },
    hintText: {
        fontSize: 12,
        color: '#c2410c',
    },
});
