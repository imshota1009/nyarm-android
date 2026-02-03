/**
 * Nyarm - アラーム型定義
 */

export interface Alarm {
    id: string;
    date: string; // YYYY-MM-DD形式
    time: string; // HH:MM形式
    label: string;
    enabled: boolean;
    createdAt: number;
}

export interface AlarmExclusions {
    sunday: boolean;
    saturday: boolean;
    holidays: boolean;
}

export interface Template {
    id: string;
    name: string;
    time: string;
    label: string;
    excludeSunday: boolean;
    excludeSaturday: boolean;
    createdAt: number;
}

export interface CalendarDay {
    date: Date;
    dateKey: string;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    hasAlarm: boolean;
    dayOfWeek: number;
}
