import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal,
  TextInput, StyleSheet,
} from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../../theme/tokens';
import { CuteCard, SectionHeader, MiniBarChart, FlowerDecoration } from '../../components/CuteComponents';
import { KEYS, getData, setData } from '../../storage/storage';

const WORKOUT_TYPES = [
  { id: 'yoga', name: 'Yoga', emoji: '🧘‍♀️', color: '#F3E5F5' },
  { id: 'running', name: 'Running', emoji: '🏃‍♀️', color: '#E3F2FD' },
  { id: 'strength', name: 'Strength', emoji: '🏋️‍♀️', color: '#FFF3E0' },
  { id: 'cycling', name: 'Cycling', emoji: '🚴‍♀️', color: '#E8F5E9' },
  { id: 'swimming', name: 'Swimming', emoji: '🏊‍♀️', color: '#E0F7FA' },
  { id: 'hiit', name: 'HIIT', emoji: '⚡', color: '#FCE4EC' },
  { id: 'dance', name: 'Dance', emoji: '💃', color: '#F3E5F5' },
  { id: 'walking', name: 'Walking', emoji: '🚶‍♀️', color: '#F1F8E9' },
  { id: 'stretching', name: 'Stretching', emoji: '🤸‍♀️', color: '#FFF8E1' },
  { id: 'pilates', name: 'Pilates', emoji: '🧎‍♀️', color: '#EDE7F6' },
];

const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

export default function WorkoutsScreen() {
  const today = formatDate(new Date());
  const [workouts, setWorkouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedType, setSelectedType] = useState('yoga');
  const [duration, setDuration] = useState('30');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const saved = await getData(KEYS.WORKOUTS);
    if (saved) setWorkouts(saved);
  };

  const todayWorkouts = workouts.filter(w => w.date === today);
  const weekWorkouts = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return workouts.filter(w => w.date >= formatDate(weekAgo));
  }, [workouts]);

  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();
    while (true) {
      if (workouts.some(w => w.date === formatDate(d))) { count++; d.setDate(d.getDate()-1); }
      else break;
    }
    return count;
  }, [workouts]);

  const totalMinutes = todayWorkouts.reduce((s, w) => s + w.duration, 0);
  const totalCals = todayWorkouts.reduce((s, w) => s + (w.calories || 0), 0);
  const weeklyMin = weekWorkouts.reduce((s, w) => s + w.duration, 0);

  const weekData = useMemo(() => {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = formatDate(d);
      const mins = workouts.filter(w => w.date === ds).reduce((s, w) => s + w.duration, 0);
      data.push({ label: days[d.getDay()], value: mins, isToday: i === 0 });
    }
    return data;
  }, [workouts]);

  const addWorkout = async () => {
    const type = WORKOUT_TYPES.find(t => t.id === selectedType);
    const workout = {
      id: Date.now(),
      date: today,
      type: selectedType,
      name: type.name,
      emoji: type.emoji,
      color: type.color,
      duration: Number(duration) || 30,
      calories: Number(calories) || 0,
      notes,
      createdAt: new Date().toISOString(),
    };
    const updated = [...workouts, workout];
    setWorkouts(updated);
    await setData(KEYS.WORKOUTS, updated);
    setDuration('30');
    setCalories('');
    setNotes('');
    setShowModal(false);
  };

  const deleteWorkout = async (id) => {
    const updated = workouts.filter(w => w.id !== id);
    setWorkouts(updated);
    await setData(KEYS.WORKOUTS, updated);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Summary */}
      <CuteCard style={{ marginBottom: 16, backgroundColor: Colors.lavender50, borderColor: 'transparent' }}>
        <View style={styles.summaryRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.summaryLabel, { color: Colors.lavender500 }]}>Today's Activity</Text>
            <Text style={styles.summaryValue}>{totalMinutes} min</Text>
            <Text style={styles.summarySub}>
              {todayWorkouts.length} workout{todayWorkouts.length !== 1 ? 's' : ''} · {totalCals} cal
            </Text>
          </View>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {streak} day{streak !== 1 ? 's' : ''}</Text>
            </View>
          )}
        </View>
      </CuteCard>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <CuteCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.lavender500 }]}>{weekWorkouts.length}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </CuteCard>
        <CuteCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.pink600 }]}>{weeklyMin}</Text>
          <Text style={styles.statLabel}>Weekly Min</Text>
        </CuteCard>
        <CuteCard style={styles.statCard}>
          <Text style={[styles.statValue, { color: Colors.mint500 }]}>{streak}</Text>
          <Text style={styles.statLabel}>Streak 🔥</Text>
        </CuteCard>
      </View>

      {/* Weekly Chart */}
      <SectionHeader title="Weekly Activity" emoji="📊" />
      <CuteCard style={{ marginBottom: 16 }}>
        <MiniBarChart data={weekData} barColor={Colors.lavender400} />
      </CuteCard>

      {/* Today's Workouts */}
      <SectionHeader title="Today's Workouts" emoji="🏋️" />
      {todayWorkouts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 40 }}>🧘‍♀️</Text>
          <Text style={styles.emptyTitle}>No workouts yet</Text>
          <Text style={styles.emptyDesc}>Tap + to log your first workout today!</Text>
        </View>
      ) : (
        todayWorkouts.map(workout => (
          <CuteCard key={workout.id} style={{ marginBottom: 8 }}>
            <View style={styles.workoutHeader}>
              <View style={[styles.workoutEmoji, { backgroundColor: workout.color }]}>
                <Text style={{ fontSize: 22 }}>{workout.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutTime}>
                  {new Date(workout.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteWorkout(workout.id)}>
                <Text style={{ color: Colors.textMuted, fontSize: 14 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.workoutStats}>
              <View style={styles.workoutStat}>
                <Text style={styles.workoutStatValue}>{workout.duration}</Text>
                <Text style={styles.workoutStatLabel}>MIN</Text>
              </View>
              {workout.calories > 0 && (
                <View style={styles.workoutStat}>
                  <Text style={styles.workoutStatValue}>{workout.calories}</Text>
                  <Text style={styles.workoutStatLabel}>CAL</Text>
                </View>
              )}
              {workout.notes ? (
                <View style={[styles.workoutStat, { flex: 2 }]}>
                  <Text style={[styles.workoutStatValue, { fontSize: 12, fontWeight: '500' }]}>{workout.notes}</Text>
                  <Text style={styles.workoutStatLabel}>NOTES</Text>
                </View>
              ) : null}
            </View>
          </CuteCard>
        ))
      )}

      <View style={{ height: 80 }} />

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, Shadows.glow]}
        onPress={() => setShowModal(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Workout Modal */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ justifyContent: 'flex-end', flexGrow: 1 }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>💪 Log Workout</Text>

              <Text style={styles.formLabel}>Workout Type</Text>
              <View style={styles.typeGrid}>
                {WORKOUT_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[styles.typeChip, selectedType === type.id && styles.typeChipActive]}
                    onPress={() => setSelectedType(type.id)}
                  >
                    <Text style={{ fontSize: 16 }}>{type.emoji}</Text>
                    <Text style={[styles.typeChipText, selectedType === type.id && { color: Colors.pink600 }]}>
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Duration (minutes)</Text>
              <TextInput style={styles.input} keyboardType="number-pad" value={duration} onChangeText={setDuration} placeholder="30" placeholderTextColor={Colors.textMuted} />

              <Text style={styles.formLabel}>Calories (optional)</Text>
              <TextInput style={styles.input} keyboardType="number-pad" value={calories} onChangeText={setCalories} placeholder="200" placeholderTextColor={Colors.textMuted} />

              <Text style={styles.formLabel}>Notes (optional)</Text>
              <TextInput style={styles.input} value={notes} onChangeText={setNotes} placeholder="Felt great today!" placeholderTextColor={Colors.textMuted} />

              <TouchableOpacity
                style={[styles.submitBtn, Shadows.glow, { marginTop: 16 }]}
                onPress={addWorkout}
              >
                <Text style={styles.submitBtnText}>💪 Log Workout</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, paddingTop: 8 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  summarySub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  streakBadge: { backgroundColor: Colors.sunny100, paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radius.full },
  streakText: { fontSize: 12, fontWeight: '700', color: '#8B6914' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 12 },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, color: Colors.textMuted, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 30 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: Colors.textPrimary, marginTop: 8 },
  emptyDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textAlign: 'center' },
  workoutHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  workoutEmoji: { width: 42, height: 42, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  workoutName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  workoutTime: { fontSize: 12, color: Colors.textSecondary },
  workoutStats: { flexDirection: 'row', gap: 8 },
  workoutStat: { flex: 1, backgroundColor: Colors.pink50, borderRadius: Radius.sm, padding: 8, alignItems: 'center' },
  workoutStatValue: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  workoutStatLabel: { fontSize: 9, color: Colors.textMuted, fontWeight: '600', marginTop: 2 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 54, height: 54, borderRadius: 27, backgroundColor: Colors.pink500, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 28, color: Colors.white, fontWeight: '300', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(61,44,62,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.cardBg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: 20, paddingBottom: 40 },
  modalHandle: { width: 36, height: 4, backgroundColor: Colors.textMuted, borderRadius: 2, alignSelf: 'center', marginBottom: 16, opacity: 0.3 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: Colors.pink50, borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1.5, borderColor: Colors.border },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  typeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: Radius.full, backgroundColor: Colors.pink50, borderWidth: 2, borderColor: 'transparent' },
  typeChipActive: { borderColor: Colors.pink500, backgroundColor: Colors.pink100 },
  typeChipText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  submitBtn: { backgroundColor: Colors.pink500, paddingVertical: 16, borderRadius: Radius.full, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  cancelBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
});
