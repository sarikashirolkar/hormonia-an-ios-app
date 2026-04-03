import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal,
  TextInput, StyleSheet,
} from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../../theme/tokens';
import { CuteCard, PillButton, SectionHeader, FlowerDecoration } from '../../components/CuteComponents';
import { KEYS, getData, setData } from '../../storage/storage';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const SYMPTOM_OPTIONS = [
  { key: 'cramps', label: 'Cramps', emoji: '😣' },
  { key: 'bloating', label: 'Bloating', emoji: '🫧' },
  { key: 'headache', label: 'Headache', emoji: '🤕' },
  { key: 'mood_swings', label: 'Mood Swings', emoji: '🎭' },
  { key: 'fatigue', label: 'Fatigue', emoji: '😴' },
  { key: 'acne', label: 'Acne', emoji: '😣' },
  { key: 'back_pain', label: 'Back Pain', emoji: '🫠' },
  { key: 'cravings', label: 'Cravings', emoji: '🍫' },
  { key: 'breast_tender', label: 'Breast Tenderness', emoji: '💗' },
  { key: 'nausea', label: 'Nausea', emoji: '🤢' },
];

const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

export default function PeriodsScreen() {
  const today = new Date();
  const todayStr = formatDate(today);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [periodDays, setPeriodDays] = useState([]);
  const [symptoms, setSymptoms] = useState({});
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [showSymptoms, setShowSymptoms] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [pcosProfile, setPcosProfile] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const pd = await getData(KEYS.PERIOD_DAYS);
    const sy = await getData(KEYS.SYMPTOMS);
    const cl = await getData(KEYS.CYCLE_LENGTH);
    const pl = await getData(KEYS.PERIOD_LENGTH);
    const pp = await getData(KEYS.PCOS_PROFILE);
    if (pd) setPeriodDays(pd);
    if (sy) setSymptoms(sy);
    if (cl) setCycleLength(cl);
    if (pl) setPeriodLength(pl);
    if (pp) setPcosProfile(pp);
  };

  const savePeriodDays = useCallback(async (days) => {
    setPeriodDays(days);
    await setData(KEYS.PERIOD_DAYS, days);
  }, []);

  const saveSymptoms = useCallback(async (sym) => {
    setSymptoms(sym);
    await setData(KEYS.SYMPTOMS, sym);
  }, []);

  const togglePeriodDay = (dateStr) => {
    const updated = periodDays.includes(dateStr)
      ? periodDays.filter(d => d !== dateStr)
      : [...periodDays, dateStr];
    savePeriodDays(updated);
  };

  const toggleSymptom = (dateStr, symptomKey) => {
    const daySymptoms = symptoms[dateStr] || [];
    const updated = daySymptoms.includes(symptomKey)
      ? daySymptoms.filter(s => s !== symptomKey)
      : [...daySymptoms, symptomKey];
    saveSymptoms({ ...symptoms, [dateStr]: updated });
  };

  // Predicted period days
  const predictedDays = useMemo(() => {
    if (periodDays.length === 0) return [];
    const sorted = [...periodDays].sort();
    const groups = [];
    let currentGroup = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      if ((curr - prev) / 86400000 <= 2) {
        currentGroup.push(sorted[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [sorted[i]];
      }
    }
    groups.push(currentGroup);
    const lastGroup = groups[groups.length - 1];
    const lastStart = new Date(lastGroup[0]);
    const predicted = [];
    for (let c = 1; c <= 3; c++) {
      const nextStart = new Date(lastStart);
      nextStart.setDate(nextStart.getDate() + cycleLength * c);
      for (let d = 0; d < periodLength; d++) {
        const day = new Date(nextStart);
        day.setDate(day.getDate() + d);
        predicted.push(formatDate(day));
      }
    }
    return predicted;
  }, [periodDays, cycleLength, periodLength]);

  // Cycle stats
  const stats = useMemo(() => {
    if (periodDays.length === 0) return { cycleDay: null, daysUntil: null, nextPeriod: null };
    const sorted = [...periodDays].sort();
    const groups = [];
    let cg = [sorted[0]];
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1]);
      const curr = new Date(sorted[i]);
      if ((curr - prev) / 86400000 <= 2) { cg.push(sorted[i]); }
      else { groups.push(cg); cg = [sorted[i]]; }
    }
    groups.push(cg);
    const lastStart = new Date(groups[groups.length - 1][0]);
    const nextStart = new Date(lastStart);
    nextStart.setDate(nextStart.getDate() + cycleLength);
    const daysUntil = Math.max(0, Math.ceil((nextStart - today) / 86400000));
    const cycleDay = Math.ceil((today - lastStart) / 86400000) + 1;
    return {
      cycleDay: cycleDay > 0 && cycleDay <= cycleLength ? cycleDay : 1,
      daysUntil,
      nextPeriod: nextStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  }, [periodDays, cycleLength]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Cycle Insight Card */}
      <CuteCard accent style={{ marginBottom: 16 }}>
        <View style={styles.insightRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightLabel}>
              {periodDays.length > 0 ? '🌙 Cycle Insight' : '🌸 Welcome'}
            </Text>
            {periodDays.length > 0 ? (
              <>
                <Text style={styles.insightValue}>Day {stats.cycleDay} of {cycleLength}</Text>
                <Text style={styles.insightSub}>
                  Next period in ~{stats.daysUntil} days ({stats.nextPeriod})
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.insightValue}>Start Tracking! 🌸</Text>
                <Text style={styles.insightSub}>Tap calendar days to log your period</Text>
              </>
            )}
          </View>
          <View style={styles.moonCircle}>
            <Text style={{ fontSize: 28 }}>🌙</Text>
          </View>
        </View>
      </CuteCard>

      {/* PCOS Type Badge */}
      {pcosProfile?.result && (
        <View style={styles.pcosRow}>
          <FlowerDecoration size={14} />
          <Text style={styles.pcosLabel}>
            {pcosProfile.result.primaryType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} PCOS
          </Text>
          <FlowerDecoration size={14} />
        </View>
      )}

      {/* Today's Symptoms */}
      {symptoms[todayStr] && symptoms[todayStr].length > 0 && (
        <View style={styles.symptomPills}>
          {symptoms[todayStr].map(key => {
            const s = SYMPTOM_OPTIONS.find(o => o.key === key);
            return s ? (
              <View key={key} style={styles.symptomPill}>
                <Text style={{ fontSize: 12 }}>{s.emoji}</Text>
                <Text style={styles.symptomPillText}>{s.label}</Text>
              </View>
            ) : null;
          })}
        </View>
      )}

      {/* Calendar */}
      <CuteCard style={{ marginBottom: 12 }}>
        <View style={styles.calHeader}>
          <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
            <Text style={styles.calNavText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calMonthTitle}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
            <Text style={styles.calNavText}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekdaysRow}>
          {WEEKDAYS.map(d => (
            <Text key={d} style={styles.weekdayLabel}>{d}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {Array.from({ length: firstDay }, (_, i) => (
            <View key={`e-${i}`} style={styles.dayCell} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const isPeriod = periodDays.includes(dateStr);
            const isPredicted = predictedDays.includes(dateStr);
            const hasSymptoms = symptoms[dateStr]?.length > 0;

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isToday && styles.dayCellToday,
                  isPeriod && styles.dayCellPeriod,
                  isPredicted && !isPeriod && styles.dayCellPredicted,
                ]}
                onPress={() => togglePeriodDay(dateStr)}
                onLongPress={() => { setSelectedDay(dateStr); setShowSymptoms(true); }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayText,
                  isToday && styles.dayTextToday,
                  isPeriod && styles.dayTextPeriod,
                ]}>
                  {day}
                </Text>
                {hasSymptoms && (
                  <View style={[styles.symptomDot, isPeriod && { backgroundColor: 'rgba(255,255,255,0.7)' }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </CuteCard>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: Colors.pink500 }]} />
          <Text style={styles.legendText}>Period</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { borderWidth: 1.5, borderColor: Colors.pink300, borderStyle: 'dashed' }]} />
          <Text style={styles.legendText}>Predicted</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { width: 5, height: 5, backgroundColor: Colors.pink500 }]} />
          <Text style={styles.legendText}>Symptoms</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <TouchableOpacity
        style={styles.secondaryBtn}
        onPress={() => setShowSettings(true)}
      >
        <Text style={styles.secondaryBtnText}>⚙️ Cycle Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryBtn, Shadows.glow, { marginTop: 8 }]}
        onPress={() => { setSelectedDay(todayStr); setShowSymptoms(true); }}
      >
        <Text style={styles.primaryBtnText}>📝 Log Today's Symptoms</Text>
      </TouchableOpacity>

      <View style={{ height: 30 }} />

      {/* Settings Modal */}
      <Modal visible={showSettings} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🌸 Cycle Settings</Text>

            <Text style={styles.formLabel}>Average Cycle Length (days)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(cycleLength)}
              onChangeText={t => { const v = Number(t); if (v > 0) setCycleLength(v); }}
            />

            <Text style={styles.formLabel}>Average Period Duration (days)</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(periodLength)}
              onChangeText={t => { const v = Number(t); if (v > 0) setPeriodLength(v); }}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, Shadows.glow, { marginTop: 16 }]}
              onPress={async () => {
                await setData(KEYS.CYCLE_LENGTH, cycleLength);
                await setData(KEYS.PERIOD_LENGTH, periodLength);
                setShowSettings(false);
              }}
            >
              <Text style={styles.primaryBtnText}>Save Changes 🎀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Symptoms Modal */}
      <Modal visible={showSymptoms} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              🌸 Symptoms for {selectedDay ? new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) : ''}
            </Text>
            <View style={styles.symptomGrid}>
              {SYMPTOM_OPTIONS.map(opt => {
                const isActive = (symptoms[selectedDay] || []).includes(opt.key);
                return (
                  <TouchableOpacity
                    key={opt.key}
                    style={[styles.symptomOption, isActive && styles.symptomOptionActive]}
                    onPress={() => selectedDay && toggleSymptom(selectedDay, opt.key)}
                  >
                    <Text style={{ fontSize: 18 }}>{opt.emoji}</Text>
                    <Text style={[styles.symptomOptionText, isActive && { color: Colors.white }]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              style={[styles.primaryBtn, Shadows.glow, { marginTop: 16 }]}
              onPress={() => setShowSymptoms(false)}
            >
              <Text style={styles.primaryBtnText}>Done 🌸</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 8 },
  insightRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  insightLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4, fontWeight: '600' },
  insightValue: { fontSize: 24, fontWeight: '700', color: Colors.white },
  insightSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  moonCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  pcosRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 12 },
  pcosLabel: { fontSize: 12, fontWeight: '700', color: Colors.pink600, textTransform: 'capitalize' },
  symptomPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  symptomPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.pink50, paddingVertical: 4, paddingHorizontal: 10, borderRadius: Radius.full },
  symptomPillText: { fontSize: 12, fontWeight: '600', color: Colors.pink700 },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  calNavBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  calNavText: { fontSize: 24, color: Colors.pink500, fontWeight: '300' },
  calMonthTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  weekdaysRow: { flexDirection: 'row', marginBottom: 4 },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase' },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayCellToday: { backgroundColor: Colors.pink50, borderRadius: Radius.full },
  dayCellPeriod: { backgroundColor: Colors.pink500, borderRadius: Radius.full },
  dayCellPredicted: { borderWidth: 1.5, borderColor: Colors.pink300, borderStyle: 'dashed', borderRadius: Radius.full },
  dayText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  dayTextToday: { fontWeight: '700', color: Colors.pink600 },
  dayTextPeriod: { color: Colors.white, fontWeight: '600' },
  symptomDot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.pink500 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: Colors.textSecondary },
  secondaryBtn: { backgroundColor: Colors.pink50, paddingVertical: 14, borderRadius: Radius.full, alignItems: 'center' },
  secondaryBtnText: { fontSize: 14, fontWeight: '600', color: Colors.pink600 },
  primaryBtn: { backgroundColor: Colors.pink500, paddingVertical: 14, borderRadius: Radius.full, alignItems: 'center' },
  primaryBtnText: { fontSize: 14, fontWeight: '700', color: Colors.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(61,44,62,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.cardBg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: 20, paddingBottom: 40, maxHeight: '85%' },
  modalHandle: { width: 36, height: 4, backgroundColor: Colors.textMuted, borderRadius: 2, alignSelf: 'center', marginBottom: 16, opacity: 0.3 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 20 },
  formLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.pink50, borderRadius: Radius.md, padding: 14, fontSize: 15, color: Colors.textPrimary, borderWidth: 1.5, borderColor: Colors.border },
  symptomGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  symptomOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: Radius.full, backgroundColor: Colors.pink50 },
  symptomOptionActive: { backgroundColor: Colors.pink500 },
  symptomOptionText: { fontSize: 13, fontWeight: '600', color: Colors.pink700 },
});
