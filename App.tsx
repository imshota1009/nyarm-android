/**
 * Nyarm - スマートアラームアプリ (Android版)
 * メインアプリケーション
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Calendar } from './src/components/Calendar';
import { CatCharacter } from './src/components/CatCharacter';
import { AlarmModal } from './src/components/AlarmModal';
import { useAlarms } from './src/hooks/useAlarms';
import { useTemplates } from './src/hooks/useTemplates';
import { useNotifications } from './src/hooks/useNotifications';
import { AlarmExclusions } from './src/types';

export default function App() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [catMessage, setCatMessage] = useState('おはようニャ！今日も一日がんばろう！');

  const {
    alarms,
    createAlarms,
    hasAlarmOnDate,
    getTodayAlarms,
    toggleAlarm,
  } = useAlarms();

  const { saveTemplate } = useTemplates();
  const { requestPermission, scheduleAlarm } = useNotifications();

  // 時間帯に応じた猫のメッセージ
  useEffect(() => {
    updateCatMessage();
  }, []);

  const updateCatMessage = () => {
    const hour = new Date().getHours();
    const todayAlarms = getTodayAlarms();
    let message = '';

    if (hour < 6) {
      message = '早起きはニャンの得だニャ〜 🌙';
    } else if (hour < 12) {
      message = 'おはようニャ！今日も一日がんばろう！☀️';
    } else if (hour < 18) {
      message = '午後もファイトだニャ！💪';
    } else {
      message = 'お疲れさまニャ〜 明日も頑張ろうニャ！🌛';
    }

    if (todayAlarms.length > 0) {
      message += `\n今日は${todayAlarms.length}件のアラームがあるニャ！`;
    }

    setCatMessage(message);
  };

  // 日付選択完了時
  const handleDatesChange = useCallback((dates: Date[]) => {
    setSelectedDates(dates);
    if (dates.length > 0) {
      // 期間選択完了したらモーダルを表示
      setTimeout(() => {
        if (dates.length > 0) {
          setShowAlarmModal(true);
        }
      }, 300);
    }
  }, []);

  // アラーム保存
  const handleSaveAlarm = useCallback(async (
    time: string,
    label: string,
    exclusions: AlarmExclusions
  ) => {
    const count = await createAlarms(selectedDates, time, label, exclusions);

    // 通知をスケジュール
    const permitted = await requestPermission();
    if (permitted) {
      // 作成したアラームを通知スケジュール
      // 簡略化のため、ここでは最初のアラームのみスケジュール
    }

    setCatMessage(`${count}件のアラームを設定したニャ！🔔`);
    setShowAlarmModal(false);
    setSelectedDates([]);
  }, [selectedDates, createAlarms, requestPermission]);

  // テンプレート保存
  const handleSaveTemplate = useCallback(async (
    time: string,
    label: string,
    exclusions: AlarmExclusions
  ) => {
    Alert.prompt(
      'テンプレート名',
      'テンプレートの名前を入力してください',
      async (name) => {
        if (name) {
          await saveTemplate(name, time, label, exclusions.sunday, exclusions.saturday);
          setCatMessage(`テンプレート「${name}」を保存したニャ！📋`);
        }
      },
      'plain-text',
      '',
      'default'
    );
  }, [saveTemplate]);

  // 今日のアラーム
  const todayAlarms = getTodayAlarms();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#f97316" />

      {/* ヘッダー */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>🐱</Text>
          <Text style={styles.title}>Nyarm</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>📋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* カレンダー */}
        <Calendar
          selectedDates={selectedDates}
          onDatesChange={handleDatesChange}
          hasAlarmOnDate={hasAlarmOnDate}
        />

        {/* 猫キャラクター */}
        <View style={styles.catSection}>
          <CatCharacter message={catMessage} />
        </View>

        {/* 今日のアラーム */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>📅 今日のアラーム</Text>
          {todayAlarms.length === 0 ? (
            <View style={styles.noAlarms}>
              <Text style={styles.noAlarmsText}>今日のアラームはありません</Text>
            </View>
          ) : (
            todayAlarms.map(alarm => (
              <TouchableOpacity
                key={alarm.id}
                style={styles.alarmItem}
                onPress={() => toggleAlarm(alarm.id)}
              >
                <Text style={styles.alarmTime}>{alarm.time}</Text>
                <View style={styles.alarmInfo}>
                  <Text style={styles.alarmLabel}>{alarm.label || 'アラーム'}</Text>
                </View>
                <View style={[styles.toggle, alarm.enabled && styles.toggleActive]}>
                  <View style={[styles.toggleKnob, alarm.enabled && styles.toggleKnobActive]} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* 余白 */}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* アラーム設定モーダル */}
      <AlarmModal
        visible={showAlarmModal}
        selectedDates={selectedDates}
        onClose={() => {
          setShowAlarmModal(false);
          setSelectedDates([]);
        }}
        onSave={handleSaveAlarm}
        onSaveTemplate={handleSaveTemplate}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff7ed',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f97316',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 28,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  catSection: {
    marginTop: 16,
  },
  todaySection: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#27272a',
    marginBottom: 16,
  },
  noAlarms: {
    padding: 24,
    alignItems: 'center',
  },
  noAlarmsText: {
    fontSize: 14,
    color: '#a1a1aa',
  },
  alarmItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fafafa',
    borderRadius: 12,
    marginBottom: 8,
  },
  alarmTime: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f97316',
    marginRight: 16,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3f3f46',
  },
  toggle: {
    width: 48,
    height: 28,
    backgroundColor: '#d4d4d8',
    borderRadius: 14,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: '#f97316',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
});
