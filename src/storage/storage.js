import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  ONBOARDING_COMPLETE: 'hormonia_onboarding_complete',
  PCOS_PROFILE: 'hormonia_pcos_profile',
  PERIOD_DAYS: 'hormonia_period_days',
  CYCLE_LENGTH: 'hormonia_cycle_length',
  PERIOD_LENGTH: 'hormonia_period_length',
  SYMPTOMS: 'hormonia_symptoms',
  MEALS: 'hormonia_meals',
  SUPPLEMENTS: 'hormonia_supplements',
  COMPLETED_MEALS: 'hormonia_completed_meals',
  COMPLETED_SUPPLEMENTS: 'hormonia_completed_supplements',
  EXTRA_FOODS: 'hormonia_extra_foods',
  WATER: 'hormonia_water',
  WORKOUTS: 'hormonia_workouts',
  STEPS: 'hormonia_steps',
  STEPS_GOAL: 'hormonia_steps_goal',
  JOURNAL: 'hormonia_journal',
  DAILY_SUBMISSIONS: 'hormonia_daily_submissions',
};

export async function getData(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function setData(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable
  }
}

export async function removeData(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export { KEYS };
