import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Modal,
  TextInput, StyleSheet, Alert,
} from 'react-native';
import { Colors, Radius, Shadows, Spacing } from '../../theme/tokens';
import { CuteCard, CuteCheckbox, SectionHeader, FlowerDecoration, MiniBarChart } from '../../components/CuteComponents';
import { KEYS, getData, setData } from '../../storage/storage';

const DEFAULT_MEALS = {
  breakfast: {
    name: 'Breakfast',
    emoji: '🥣',
    items: [
      { id: 'b1', label: '1 tbsp fibre — chia seeds', checked: false },
      { id: 'b2', label: '40g protein — paneer, channa, drink', checked: false },
      { id: 'b3', label: 'Carbs', checked: false, hasInput: true, inputValue: '' },
      { id: 'b4', label: 'Fruit', checked: false, hasInput: true, inputValue: '' },
    ],
  },
  lunch: {
    name: 'Lunch',
    emoji: '🥗',
    items: [
      { id: 'l1', label: 'Fiber — salad', checked: false },
      { id: 'l2', label: '15g protein — vegetable curry, dal', checked: false },
      { id: 'l3', label: 'Carbs — roti, rice', checked: false },
    ],
  },
  dinner: {
    name: 'Dinner',
    emoji: '🍲',
    items: [
      { id: 'd1', label: 'Soup', checked: false },
      { id: 'd2', label: 'Salad', checked: false },
    ],
  },
};

const DEFAULT_SUPPLEMENTS = [
  { id: 's1', label: 'Creatine', checked: false },
  { id: 's2', label: 'Protein', checked: false },
  { id: 's3', label: 'PCOS Supplement', checked: false },
  { id: 's4', label: 'Vitamin-D', checked: false },
];

const formatDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function FoodScreen() {
  const today = formatDate(new Date());
  const [meals, setMeals] = useState(JSON.parse(JSON.stringify(DEFAULT_MEALS)));
  const [supplements, setSupplements] = useState([...DEFAULT_SUPPLEMENTS.map(s => ({...s}))]);
  const [waterCount, setWaterCount] = useState(0);
  const [extraFoods, setExtraFoods] = useState([]);
  const [showAddExtra, setShowAddExtra] = useState(false);
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodQty, setNewFoodQty] = useState('');
  const [showMentalHealth, setShowMentalHealth] = useState(false);
  const [showDailyGraph, setShowDailyGraph] = useState(false);
  const [showEditSupplements, setShowEditSupplements] = useState(false);
  const [newSupplement, setNewSupplement] = useState('');
  const [todaySubmitted, setTodaySubmitted] = useState(false);
  const [dailySubmission, setDailySubmission] = useState(null);

  // Mental health state
  const [mood, setMood] = useState(null);
  const [feelings, setFeelings] = useState('');
  const [activities, setActivities] = useState('');
  const [journal, setJournal] = useState('');
  const [gratitude, setGratitude] = useState('');

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    const savedMeals = await getData(KEYS.MEALS);
    const savedSupps = await getData(KEYS.SUPPLEMENTS);
    const savedCompleted = await getData(KEYS.COMPLETED_MEALS);
    const savedCompletedSupps = await getData(KEYS.COMPLETED_SUPPLEMENTS);
    const savedExtras = await getData(KEYS.EXTRA_FOODS);
    const savedWater = await getData(KEYS.WATER);
    const savedSubmissions = await getData(KEYS.DAILY_SUBMISSIONS);

    if (savedSupps) setSupplements(savedSupps);

    // Load today's completed data
    if (savedCompleted?.[today]) {
      const todayCompleted = savedCompleted[today];
      const updatedMeals = JSON.parse(JSON.stringify(savedMeals || DEFAULT_MEALS));
      Object.keys(updatedMeals).forEach(mealKey => {
        updatedMeals[mealKey].items = updatedMeals[mealKey].items.map(item => ({
          ...item,
          checked: todayCompleted.items?.includes(item.id) || false,
          inputValue: todayCompleted.inputs?.[item.id] || item.inputValue || '',
        }));
      });
      setMeals(updatedMeals);
    } else if (savedMeals) {
      setMeals(savedMeals);
    }

    if (savedCompletedSupps?.[today]) {
      const todaySupps = savedCompletedSupps[today];
      setSupplements(prev => prev.map(s => ({
        ...s,
        checked: todaySupps.includes(s.id),
      })));
    }

    if (savedExtras?.[today]) setExtraFoods(savedExtras[today]);
    if (savedWater?.date === today) setWaterCount(savedWater.glasses);

    if (savedSubmissions?.[today]) {
      setTodaySubmitted(true);
      setDailySubmission(savedSubmissions[today]);
    }
  };

  const saveProgress = useCallback(async (updatedMeals, updatedSupps, updatedExtras, updatedWater) => {
    const m = updatedMeals || meals;
    const s = updatedSupps || supplements;
    const e = updatedExtras || extraFoods;
    const w = updatedWater !== undefined ? updatedWater : waterCount;

    // Save completed items
    const completedItems = [];
    const completedInputs = {};
    Object.values(m).forEach(meal => {
      meal.items.forEach(item => {
        if (item.checked) completedItems.push(item.id);
        if (item.inputValue) completedInputs[item.id] = item.inputValue;
      });
    });

    const existingCompleted = await getData(KEYS.COMPLETED_MEALS) || {};
    existingCompleted[today] = { items: completedItems, inputs: completedInputs };
    await setData(KEYS.COMPLETED_MEALS, existingCompleted);

    const existingCompletedSupps = await getData(KEYS.COMPLETED_SUPPLEMENTS) || {};
    existingCompletedSupps[today] = s.filter(sup => sup.checked).map(sup => sup.id);
    await setData(KEYS.COMPLETED_SUPPLEMENTS, existingCompletedSupps);

    const existingExtras = await getData(KEYS.EXTRA_FOODS) || {};
    existingExtras[today] = e;
    await setData(KEYS.EXTRA_FOODS, existingExtras);

    await setData(KEYS.WATER, { date: today, glasses: w });
  }, [meals, supplements, extraFoods, waterCount, today]);

  const toggleMealItem = (mealKey, itemId) => {
    const updated = { ...meals };
    updated[mealKey] = {
      ...updated[mealKey],
      items: updated[mealKey].items.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      ),
    };
    setMeals(updated);
    saveProgress(updated);
  };

  const updateMealInput = (mealKey, itemId, value) => {
    const updated = { ...meals };
    updated[mealKey] = {
      ...updated[mealKey],
      items: updated[mealKey].items.map(item =>
        item.id === itemId ? { ...item, inputValue: value } : item
      ),
    };
    setMeals(updated);
  };

  const toggleSupplement = (suppId) => {
    const updated = supplements.map(s =>
      s.id === suppId ? { ...s, checked: !s.checked } : s
    );
    setSupplements(updated);
    saveProgress(meals, updated);
  };

  const addExtraFood = () => {
    if (!newFoodName.trim()) return;
    const newItem = { id: Date.now().toString(), name: newFoodName.trim(), quantity: newFoodQty.trim() };
    const updated = [...extraFoods, newItem];
    setExtraFoods(updated);
    setNewFoodName('');
    setNewFoodQty('');
    setShowAddExtra(false);
    saveProgress(meals, supplements, updated);
  };

  const removeExtraFood = (id) => {
    const updated = extraFoods.filter(f => f.id !== id);
    setExtraFoods(updated);
    saveProgress(meals, supplements, updated);
  };

  const addWater = () => {
    const updated = waterCount + 1;
    setWaterCount(updated);
    saveProgress(meals, supplements, extraFoods, updated);
  };

  const removeWater = () => {
    if (waterCount > 0) {
      const updated = waterCount - 1;
      setWaterCount(updated);
      saveProgress(meals, supplements, extraFoods, updated);
    }
  };

  const addNewSupplement = async () => {
    if (!newSupplement.trim()) return;
    const updated = [...supplements, { id: `s_${Date.now()}`, label: newSupplement.trim(), checked: false }];
    setSupplements(updated);
    await setData(KEYS.SUPPLEMENTS, updated);
    setNewSupplement('');
  };

  const removeSupplement = async (id) => {
    const updated = supplements.filter(s => s.id !== id);
    setSupplements(updated);
    await setData(KEYS.SUPPLEMENTS, updated);
  };

  // Calculate completion stats
  const totalMealItems = Object.values(meals).reduce((sum, m) => sum + m.items.length, 0);
  const checkedMealItems = Object.values(meals).reduce((sum, m) => sum + m.items.filter(i => i.checked).length, 0);
  const checkedSupps = supplements.filter(s => s.checked).length;
  const mealPct = totalMealItems > 0 ? Math.round((checkedMealItems / totalMealItems) * 100) : 0;
  const suppPct = supplements.length > 0 ? Math.round((checkedSupps / supplements.length) * 100) : 0;
  const waterPct = Math.min(Math.round((waterCount / 8) * 100), 100);

  const MOODS = [
    { key: 1, emoji: '😢', label: 'Low' },
    { key: 2, emoji: '😟', label: 'Meh' },
    { key: 3, emoji: '😐', label: 'Okay' },
    { key: 4, emoji: '😊', label: 'Good' },
    { key: 5, emoji: '🥰', label: 'Great' },
  ];

  const handleSubmitDay = () => {
    setShowMentalHealth(true);
  };

  const submitWithJournal = async () => {
    if (!mood) {
      Alert.alert('💗', 'Please select how you\'re feeling today');
      return;
    }

    const submission = {
      date: today,
      meals: { ...meals },
      supplements: [...supplements],
      extraFoods: [...extraFoods],
      water: waterCount,
      mentalHealth: {
        mood,
        feelings,
        activities,
        journal,
        gratitude,
      },
      stats: {
        mealPct,
        suppPct,
        waterPct,
        totalItems: totalMealItems + supplements.length + 1, // +1 for water
        completedItems: checkedMealItems + checkedSupps + (waterCount >= 8 ? 1 : 0),
      },
      submittedAt: new Date().toISOString(),
    };

    const existing = await getData(KEYS.DAILY_SUBMISSIONS) || {};
    existing[today] = submission;
    await setData(KEYS.DAILY_SUBMISSIONS, existing);

    // Also save journal entry
    const existingJournal = await getData(KEYS.JOURNAL) || {};
    existingJournal[today] = submission.mentalHealth;
    await setData(KEYS.JOURNAL, existingJournal);

    setTodaySubmitted(true);
    setDailySubmission(submission);
    setShowMentalHealth(false);
    setShowDailyGraph(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

      {/* Progress Summary */}
      <CuteCard style={{ marginBottom: 16, backgroundColor: Colors.mint50, borderColor: 'transparent' }}>
        <View style={styles.progressRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.progressLabel, { color: Colors.mint500 }]}>Today's Progress</Text>
            <Text style={styles.progressValue}>{checkedMealItems}/{totalMealItems} meals</Text>
            <Text style={styles.progressSub}>{mealPct}% complete {mealPct === 100 ? '🎉' : ''}</Text>
          </View>
          <View style={styles.progressCircle}>
            <Text style={[styles.progressCircleText, { color: Colors.mint500 }]}>{mealPct}%</Text>
          </View>
        </View>
      </CuteCard>

      {/* Water Tracker */}
      <SectionHeader title="Water Intake" emoji="💧" action="Goal: 8" />
      <CuteCard style={{ marginBottom: 16 }}>
        <View style={styles.waterRow}>
          <View style={styles.waterDrops}>
            {Array.from({ length: 8 }, (_, i) => (
              <Text key={i} style={{ fontSize: 22, opacity: i < waterCount ? 1 : 0.2 }}>💧</Text>
            ))}
          </View>
          <View style={styles.waterBtns}>
            <TouchableOpacity style={styles.waterBtn} onPress={removeWater}>
              <Text style={styles.waterBtnText}>−</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.waterBtn, styles.waterBtnPlus]} onPress={addWater}>
              <Text style={[styles.waterBtnText, { color: Colors.white }]}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.waterLabel}>{waterCount}/8 glasses{waterCount >= 8 ? ' ✨ Goal reached!' : ''}</Text>
      </CuteCard>

      {/* Meals */}
      {Object.entries(meals).map(([mealKey, meal]) => (
        <View key={mealKey}>
          <SectionHeader title={meal.name} emoji={meal.emoji} />
          {meal.items.map(item => (
            <View key={item.id}>
              <CuteCheckbox
                checked={item.checked}
                onPress={() => toggleMealItem(mealKey, item.id)}
                label={item.label}
              />
              {item.hasInput && (
                <TextInput
                  style={styles.inlineInput}
                  placeholder={`What ${item.label.toLowerCase()}?`}
                  placeholderTextColor={Colors.textMuted}
                  value={item.inputValue}
                  onChangeText={(v) => updateMealInput(mealKey, item.id, v)}
                  onBlur={() => saveProgress()}
                />
              )}
            </View>
          ))}
        </View>
      ))}

      {/* Supplements */}
      <SectionHeader title="Supplements" emoji="💊" action="Edit" onAction={() => setShowEditSupplements(true)} />
      {supplements.map(supp => (
        <CuteCheckbox
          key={supp.id}
          checked={supp.checked}
          onPress={() => toggleSupplement(supp.id)}
          label={supp.label}
        />
      ))}

      {/* Extra Food */}
      <SectionHeader title="Extra Foods" emoji="🍕" action="+ Add" onAction={() => setShowAddExtra(true)} />
      {extraFoods.length === 0 ? (
        <Text style={styles.emptyText}>No extra foods logged today</Text>
      ) : (
        extraFoods.map(food => (
          <CuteCard key={food.id} style={{ marginBottom: 6, padding: 12 }}>
            <View style={styles.extraFoodRow}>
              <View>
                <Text style={styles.extraFoodName}>{food.name}</Text>
                {food.quantity ? <Text style={styles.extraFoodQty}>{food.quantity}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => removeExtraFood(food.id)}>
                <Text style={{ color: Colors.textMuted, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>
          </CuteCard>
        ))
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitBtn, Shadows.glow, { marginTop: 24 }, todaySubmitted && styles.submitBtnDone]}
        onPress={todaySubmitted ? () => setShowDailyGraph(true) : handleSubmitDay}
        activeOpacity={0.8}
      >
        <Text style={styles.submitBtnText}>
          {todaySubmitted ? '📊 View Today\'s Summary' : '✨ Submit Today\'s Log'}
        </Text>
      </TouchableOpacity>

      {todaySubmitted && (
        <Text style={styles.submittedLabel}>✅ Submitted at {new Date(dailySubmission?.submittedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</Text>
      )}

      <View style={{ height: 30 }} />

      {/* Add Extra Food Modal */}
      <Modal visible={showAddExtra} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>🍕 Add Extra Food</Text>

            <Text style={styles.formLabel}>Food Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dark chocolate"
              placeholderTextColor={Colors.textMuted}
              value={newFoodName}
              onChangeText={setNewFoodName}
            />

            <Text style={styles.formLabel}>Quantity (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 2 squares, 100g"
              placeholderTextColor={Colors.textMuted}
              value={newFoodQty}
              onChangeText={setNewFoodQty}
            />

            <TouchableOpacity
              style={[styles.submitBtn, Shadows.glow, { marginTop: 16 }]}
              onPress={addExtraFood}
            >
              <Text style={styles.submitBtnText}>Add Food 🍽️</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelBtn, { marginTop: 8 }]}
              onPress={() => setShowAddExtra(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Supplements Modal */}
      <Modal visible={showEditSupplements} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>💊 Edit Supplements</Text>

            {supplements.map(supp => (
              <View key={supp.id} style={styles.editSuppRow}>
                <Text style={styles.editSuppText}>{supp.label}</Text>
                <TouchableOpacity onPress={() => removeSupplement(supp.id)}>
                  <Text style={{ color: Colors.error, fontSize: 14 }}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View style={styles.addSuppRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="New supplement name"
                placeholderTextColor={Colors.textMuted}
                value={newSupplement}
                onChangeText={setNewSupplement}
              />
              <TouchableOpacity style={styles.addSuppBtn} onPress={addNewSupplement}>
                <Text style={{ color: Colors.white, fontWeight: '700' }}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, Shadows.glow, { marginTop: 16 }]}
              onPress={() => setShowEditSupplements(false)}
            >
              <Text style={styles.submitBtnText}>Done 🎀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Mental Health Check-In Modal */}
      <Modal visible={showMentalHealth} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ justifyContent: 'flex-end', flexGrow: 1 }}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>💗 Before you go...</Text>
              <Text style={styles.modalSubtitle}>How are you feeling today? 🌸</Text>

              {/* Mood Selector */}
              <View style={styles.moodRow}>
                {MOODS.map(m => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.moodItem, mood === m.key && styles.moodItemActive]}
                    onPress={() => setMood(m.key)}
                  >
                    <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, mood === m.key && { color: Colors.pink600, fontWeight: '700' }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>How are you feeling? 🌿</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="I'm feeling..."
                placeholderTextColor={Colors.textMuted}
                value={feelings}
                onChangeText={setFeelings}
                multiline
              />

              <Text style={styles.formLabel}>What did you do today? 🎯</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Today I..."
                placeholderTextColor={Colors.textMuted}
                value={activities}
                onChangeText={setActivities}
                multiline
              />

              <Text style={styles.formLabel}>Anything on your mind? 📝</Text>
              <TextInput
                style={[styles.input, styles.multilineInput, { minHeight: 80 }]}
                placeholder="Write freely..."
                placeholderTextColor={Colors.textMuted}
                value={journal}
                onChangeText={setJournal}
                multiline
              />

              <Text style={styles.formLabel}>One thing I'm grateful for today 🙏</Text>
              <TextInput
                style={styles.input}
                placeholder="I'm grateful for..."
                placeholderTextColor={Colors.textMuted}
                value={gratitude}
                onChangeText={setGratitude}
              />

              <TouchableOpacity
                style={[styles.submitBtn, Shadows.glow, { marginTop: 20 }]}
                onPress={submitWithJournal}
              >
                <Text style={styles.submitBtnText}>Submit & Save 🌸</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.cancelBtn, { marginTop: 8 }]}
                onPress={() => setShowMentalHealth(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Daily Summary Graph Modal */}
      <Modal visible={showDailyGraph} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>📊 Today's Summary</Text>

            {/* Completion bars */}
            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>🍽️ Meals</Text>
              <View style={styles.summaryBarBg}>
                <View style={[styles.summaryBarFill, { width: `${mealPct}%`, backgroundColor: Colors.mint400 }]} />
              </View>
              <Text style={styles.summaryPct}>{mealPct}%</Text>
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>💊 Supplements</Text>
              <View style={styles.summaryBarBg}>
                <View style={[styles.summaryBarFill, { width: `${suppPct}%`, backgroundColor: Colors.lavender400 }]} />
              </View>
              <Text style={styles.summaryPct}>{suppPct}%</Text>
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.summaryLabel}>💧 Water</Text>
              <View style={styles.summaryBarBg}>
                <View style={[styles.summaryBarFill, { width: `${waterPct}%`, backgroundColor: Colors.sky500 }]} />
              </View>
              <Text style={styles.summaryPct}>{waterCount}/8</Text>
            </View>

            {extraFoods.length > 0 && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryLabel}>🍕 Extras</Text>
                <Text style={[styles.summaryPct, { flex: 1 }]}>
                  {extraFoods.map(f => f.name).join(', ')}
                </Text>
              </View>
            )}

            {dailySubmission?.mentalHealth && (
              <View style={styles.summaryMood}>
                <Text style={{ fontSize: 32 }}>{MOODS.find(m => m.key === dailySubmission.mentalHealth.mood)?.emoji || '😐'}</Text>
                <Text style={styles.summaryMoodLabel}>
                  Mood: {MOODS.find(m => m.key === dailySubmission.mentalHealth.mood)?.label || 'N/A'}
                </Text>
                {dailySubmission.mentalHealth.gratitude ? (
                  <Text style={styles.summaryGratitude}>
                    🙏 "{dailySubmission.mentalHealth.gratitude}"
                  </Text>
                ) : null}
              </View>
            )}

            {/* Overall Score */}
            <View style={styles.overallScore}>
              <Text style={styles.overallScoreValue}>
                {Math.round((mealPct + suppPct + waterPct) / 3)}%
              </Text>
              <Text style={styles.overallScoreLabel}>Overall Completion</Text>
              <FlowerDecoration size={16} />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, Shadows.glow, { marginTop: 16 }]}
              onPress={() => setShowDailyGraph(false)}
            >
              <Text style={styles.submitBtnText}>Close 🎀</Text>
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
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  progressValue: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  progressSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  progressCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.mint200, alignItems: 'center', justifyContent: 'center' },
  progressCircleText: { fontSize: 14, fontWeight: '700' },
  waterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  waterDrops: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, flex: 1 },
  waterBtns: { flexDirection: 'row', gap: 6 },
  waterBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.pink50, alignItems: 'center', justifyContent: 'center' },
  waterBtnPlus: { backgroundColor: Colors.pink500 },
  waterBtnText: { fontSize: 18, fontWeight: '600', color: Colors.pink600 },
  waterLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 8 },
  inlineInput: { backgroundColor: Colors.pink50, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: Colors.textPrimary, marginBottom: 6, marginLeft: 36, marginTop: -2 },
  extraFoodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  extraFoodName: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  extraFoodQty: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 12 },
  submitBtn: { backgroundColor: Colors.pink500, paddingVertical: 16, borderRadius: Radius.full, alignItems: 'center' },
  submitBtnDone: { backgroundColor: Colors.mint400 },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: Colors.white },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  submittedLabel: { fontSize: 12, color: Colors.mint500, textAlign: 'center', marginTop: 8, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(61,44,62,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.cardBg, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: 20, paddingBottom: 40, maxHeight: '90%' },
  modalHandle: { width: 36, height: 4, backgroundColor: Colors.textMuted, borderRadius: 2, alignSelf: 'center', marginBottom: 16, opacity: 0.3 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  modalSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: Colors.pink50, borderRadius: Radius.md, padding: 14, fontSize: 14, color: Colors.textPrimary, borderWidth: 1.5, borderColor: Colors.border },
  multilineInput: { minHeight: 60, textAlignVertical: 'top' },
  // Mood
  moodRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  moodItem: { alignItems: 'center', padding: 8, borderRadius: Radius.md },
  moodItemActive: { backgroundColor: Colors.pink50, transform: [{ scale: 1.1 }] },
  moodLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 4, fontWeight: '600' },
  // Edit supplements
  editSuppRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  editSuppText: { fontSize: 14, fontWeight: '500', color: Colors.textPrimary },
  addSuppRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  addSuppBtn: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.pink500, alignItems: 'center', justifyContent: 'center' },
  // Summary
  summarySection: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  summaryLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, width: 90 },
  summaryBarBg: { flex: 1, height: 10, backgroundColor: Colors.pink100, borderRadius: 5, overflow: 'hidden' },
  summaryBarFill: { height: '100%', borderRadius: 5 },
  summaryPct: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, width: 40, textAlign: 'right' },
  summaryMood: { alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.divider },
  summaryMoodLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary, marginTop: 4 },
  summaryGratitude: { fontSize: 13, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 8, textAlign: 'center' },
  overallScore: { alignItems: 'center', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.divider },
  overallScoreValue: { fontSize: 36, fontWeight: '700', color: Colors.pink500 },
  overallScoreLabel: { fontSize: 13, color: Colors.textSecondary, marginTop: 2, marginBottom: 4 },
});
