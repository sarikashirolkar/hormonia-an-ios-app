import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal,
  TextInput, StyleSheet,
} from 'react-native';
import { Colors, Radius, Shadows } from '../../theme/tokens';
import { CuteCard, SectionHeader, ProgressRing, MiniBarChart } from '../../components/CuteComponents';
import { KEYS, getData, setData } from '../../storage/storage';

const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

export default function StepsScreen() {
  const today = formatDate(new Date());
  const [stepsData, setStepsData] = useState({});
  const [goal, setGoal] = useState(10000);
  const [showCustom, setShowCustom] = useState(false);
  const [showGoal, setShowGoal] = useState(false);
  const [inputSteps, setInputSteps] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const sd = await getData(KEYS.STEPS);
    const g = await getData(KEYS.STEPS_GOAL);
    if (sd) setStepsData(sd);
    if (g) setGoal(g);
  };

  const todaySteps = stepsData[today] || 0;
  const distanceKm = ((todaySteps * 0.762) / 1000).toFixed(1);
  const caloriesBurned = Math.round(todaySteps * 0.04);
  const progress = Math.min((todaySteps / goal) * 100, 100);

  const weekData = useMemo(() => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = formatDate(d);
      data.push({ label: days[d.getDay()], value: stepsData[ds] || 0, isToday: i === 0 });
    }
    return data;
  }, [stepsData]);

  const weeklyAvg = Math.round(weekData.reduce((s, d) => s + d.value, 0) / 7);
  const weeklyTotal = weekData.reduce((s, d) => s + d.value, 0);
  const bestDay = Math.max(...weekData.map(d => d.value), 0);

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    while (true) {
      if ((stepsData[formatDate(d)] || 0) >= goal) { count++; d.setDate(d.getDate()-1); }
      else break;
    }
    return count;
  }, [stepsData, goal]);

  const addSteps = async (amount) => {
    const updated = { ...stepsData, [today]: (stepsData[today] || 0) + amount };
    setStepsData(updated);
    await setData(KEYS.STEPS, updated);
  };

  const addCustomSteps = async () => {
    const val = Number(inputSteps);
    if (val > 0) {
      await addSteps(val);
      setInputSteps('');
      setShowCustom(false);
    }
  };

  const saveGoal = async (newGoal) => {
    setGoal(newGoal);
    await setData(KEYS.STEPS_GOAL, newGoal);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero Ring */}
      <View style={styles.hero}>
        <ProgressRing
          value={todaySteps}
          max={goal}
          size={180}
          strokeWidth={14}
          color={todaySteps >= goal ? Colors.mint400 : Colors.pink500}
          unit={`/ ${(goal / 1000).toFixed(0)}k`}
        />
        {todaySteps >= goal && (
          <View style={styles.goalBadge}>
            <Text style={styles.goalBadgeText}>🎉 Goal reached!</Text>
          </View>
        )}
        {streak > 1 && (
          <View style={[styles.goalBadge, { backgroundColor: Colors.sunny100 }]}>
            <Text style={[styles.goalBadgeText, { color: '#8B6914' }]}>🔥 {streak} day streak</Text>
          </View>
        )}
      </View>

      {/* Quick Add */}
      <View style={styles.quickAddRow}>
        {[500, 1000, 2000, 5000].map(amount => (
          <TouchableOpacity key={amount} style={styles.quickAddBtn} onPress={() => addSteps(amount)} activeOpacity={0.7}>
            <Text style={styles.quickAddText}>+{amount >= 1000 ? `${amount / 1000}k` : amount}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={[styles.quickAddBtn, styles.quickAddCustom]} onPress={() => setShowCustom(true)}>
          <Text style={[styles.quickAddText, { color: Colors.white }]}>Custom</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <CuteCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.sky500 }]}>{distanceKm}</Text>
          <Text style={styles.statLabel}>KM Walked</Text>
        </CuteCard>
        <CuteCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.coral500 }]}>{caloriesBurned}</Text>
          <Text style={styles.statLabel}>Calories</Text>
        </CuteCard>
        <CuteCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.mint500 }]}>{Math.round(progress)}%</Text>
          <Text style={styles.statLabel}>of Goal</Text>
        </CuteCard>
      </View>

      {/* Weekly */}
      <SectionHeader title="This Week" emoji="📈" action={`🎯 Goal: ${(goal/1000).toFixed(0)}k`} onAction={() => setShowGoal(true)} />
      <CuteCard style={{ marginBottom: 12 }}>
        <MiniBarChart data={weekData} maxValue={Math.max(bestDay, goal)} barColor={Colors.pink500} />
        <View style={styles.weekSummary}>
          <Text style={styles.weekSumText}>Avg: <Text style={{ fontWeight: '700' }}>{weeklyAvg.toLocaleString()}</Text></Text>
          <Text style={styles.weekSumText}>Total: <Text style={{ fontWeight: '700' }}>{weeklyTotal.toLocaleString()}</Text></Text>
          <Text style={styles.weekSumText}>Best: <Text style={{ fontWeight: '700' }}>{bestDay.toLocaleString()}</Text></Text>
        </View>
      </CuteCard>

      <View style={{ height: 30 }} />

      {/* Custom Steps Modal */}
      <Modal visible={showCustom} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>👟 Add Steps</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={inputSteps}
              onChangeText={setInputSteps}
              placeholder="e.g. 3500"
              placeholderTextColor={Colors.textMuted}
              autoFocus
            />
            <TouchableOpacity style={[styles.submitBtn, Shadows.glow, { marginTop: 16 }]} onPress={addCustomSteps}>
              <Text style={styles.submitBtnText}>Add Steps 👟</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCustom(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Goal Modal */}
      <Modal visible={showGoal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🎯 Set Daily Goal</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={String(goal)}
              onChangeText={t => { const v = Number(t); if (v > 0) saveGoal(v); }}
            />
            <View style={styles.goalPresets}>
              {[5000, 7500, 10000, 12000, 15000].map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.goalPresetBtn, goal === g && styles.goalPresetActive]}
                  onPress={() => saveGoal(g)}
                >
                  <Text style={[styles.goalPresetText, goal === g && { color: Colors.white }]}>
                    {(g / 1000).toFixed(0)}k
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.submitBtn, Shadows.glow, { marginTop: 16 }]} onPress={() => setShowGoal(false)}>
              <Text style={styles.submitBtnText}>Save Goal 🌸</Text>
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
  hero: { alignItems: 'center', paddingVertical: 16 },
  goalBadge: { backgroundColor: Colors.mint50, paddingVertical: 5, paddingHorizontal: 14, borderRadius: Radius.full, marginTop: 8 },
  goalBadgeText: { fontSize: 12, fontWeight: '700', color: Colors.mint500 },
  quickAddRow: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 20, flexWrap: 'wrap' },
  quickAddBtn: { backgroundColor: Colors.pink50, paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radius.full },
  quickAddCustom: { backgroundColor: Colors.pink500 },
  quickAddText: { fontSize: 13, fontWeight: '600', color: Colors.pink600 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 12 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  weekSummary: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.divider },
  weekSumText: { fontSize: 12, color: Colors.textSecondary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(61,44,62,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.cardBg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, backgroundColor: Colors.textMuted, borderRadius: 2, alignSelf: 'center', marginBottom: 16, opacity: 0.3 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  input: { backgroundColor: Colors.pink50, borderRadius: Radius.md, padding: 14, fontSize: 15, color: Colors.textPrimary, borderWidth: 1.5, borderColor: Colors.border },
  submitBtn: { backgroundColor: Colors.pink500, paddingVertical: 16, borderRadius: Radius.full, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  goalPresets: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 12 },
  goalPresetBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: Radius.full, backgroundColor: Colors.pink50 },
  goalPresetActive: { backgroundColor: Colors.pink500 },
  goalPresetText: { fontSize: 13, fontWeight: '600', color: Colors.pink600 },
});
