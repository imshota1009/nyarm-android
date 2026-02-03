/**
 * Nyarm - アラーム設定モーダル
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    Switch,
    ScrollView,
    Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDisplayDate } from '../utils/date';
import { AlarmExclusions } from '../types';

interface Props {
    visible: boolean;
    selectedDates: Date[];
    onClose: () => void;
    onSave: (time: string, label: string, exclusions: AlarmExclusions) => void;
    onSaveTemplate: (time: string, label: string, exclusions: AlarmExclusions) => void;
}

export const AlarmModal: React.FC<Props> = ({
    visible,
    selectedDates,
    onClose,
    onSave,
    onSaveTemplate,
}) => {
    const [time, setTime] = useState(new Date());
    const [label, setLabel] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [exclusions, setExclusions] = useState<AlarmExclusions>({
        sunday: false,
        saturday: false,
        holidays: false,
    });

    useEffect(() => {
        // デフォルト時刻を7:00に設定
        const defaultTime = new Date();
        defaultTime.setHours(7, 0, 0, 0);
        setTime(defaultTime);
    }, [visible]);

    const formatTimeStr = (date: Date): string => {
        return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    const handleTimeChange = (_event: any, selectedTime?: Date) => {
        setShowTimePicker(Platform.OS === 'ios');
        if (selectedTime) {
            setTime(selectedTime);
        }
    };

    const handleSave = () => {
        onSave(formatTimeStr(time), label, exclusions);
        resetForm();
    };

    const handleSaveTemplate = () => {
        onSaveTemplate(formatTimeStr(time), label, exclusions);
    };

    const resetForm = () => {
        setLabel('');
        setExclusions({ sunday: false, saturday: false, holidays: false });
    };

    const getPeriodDisplay = (): string => {
        if (selectedDates.length === 0) return '';
        const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
        const start = sorted[0];
        const end = sorted[sorted.length - 1];
        if (start.getTime() === end.getTime()) {
            return formatDisplayDate(start);
        }
        return `${formatDisplayDate(start)} 〜 ${formatDisplayDate(end)}`;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* ヘッダー */}
                    <View style={styles.header}>
                        <Text style={styles.title}>⏰ アラーム設定</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {/* 選択期間 */}
                        <View style={styles.periodContainer}>
                            <Text style={styles.periodLabel}>選択期間：</Text>
                            <Text style={styles.periodValue}>{getPeriodDisplay()}</Text>
                        </View>

                        {/* 時刻設定 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>アラーム時刻</Text>
                            <TouchableOpacity
                                style={styles.timeButton}
                                onPress={() => setShowTimePicker(true)}
                            >
                                <Text style={styles.timeButtonText}>{formatTimeStr(time)}</Text>
                            </TouchableOpacity>
                        </View>

                        {showTimePicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                is24Hour={true}
                                display="spinner"
                                onChange={handleTimeChange}
                            />
                        )}

                        {/* 除外設定 */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>除外設定</Text>
                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>日曜を除外</Text>
                                <Switch
                                    value={exclusions.sunday}
                                    onValueChange={(v) => setExclusions({ ...exclusions, sunday: v })}
                                    trackColor={{ false: '#e4e4e7', true: '#fdba74' }}
                                    thumbColor={exclusions.sunday ? '#f97316' : '#fff'}
                                />
                            </View>
                            <View style={styles.switchRow}>
                                <Text style={styles.switchLabel}>土曜を除外</Text>
                                <Switch
                                    value={exclusions.saturday}
                                    onValueChange={(v) => setExclusions({ ...exclusions, saturday: v })}
                                    trackColor={{ false: '#e4e4e7', true: '#fdba74' }}
                                    thumbColor={exclusions.saturday ? '#f97316' : '#fff'}
                                />
                            </View>
                        </View>

                        {/* ラベル */}
                        <View style={styles.section}>
                            <Text style={styles.sectionLabel}>ラベル（任意）</Text>
                            <TextInput
                                style={styles.input}
                                value={label}
                                onChangeText={setLabel}
                                placeholder="例：講義の日"
                                placeholderTextColor="#a1a1aa"
                            />
                        </View>

                        {/* テンプレート保存 */}
                        <TouchableOpacity style={styles.templateButton} onPress={handleSaveTemplate}>
                            <Text style={styles.templateButtonText}>💾 テンプレートとして保存</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {/* フッター */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                            <Text style={styles.cancelButtonText}>キャンセル</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>✓ アラームを設定</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f4f4f5',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#27272a',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f4f4f5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#71717a',
    },
    body: {
        padding: 20,
    },
    periodContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff7ed',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#fed7aa',
        marginBottom: 20,
    },
    periodLabel: {
        fontSize: 14,
        color: '#71717a',
    },
    periodValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#c2410c',
        marginLeft: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3f3f46',
        marginBottom: 8,
    },
    timeButton: {
        backgroundColor: '#f4f4f5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    timeButtonText: {
        fontSize: 32,
        fontWeight: '800',
        color: '#27272a',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fafafa',
        borderRadius: 8,
        marginBottom: 8,
    },
    switchLabel: {
        fontSize: 14,
        color: '#3f3f46',
    },
    input: {
        backgroundColor: '#f4f4f5',
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: '#27272a',
    },
    templateButton: {
        backgroundColor: '#f4f4f5',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    templateButtonText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#71717a',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#f4f4f5',
    },
    cancelButton: {
        backgroundColor: '#f4f4f5',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 1,
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#71717a',
    },
    saveButton: {
        backgroundColor: '#f97316',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        flex: 2,
    },
    saveButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
});
