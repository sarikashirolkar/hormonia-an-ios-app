// PCOS Type Scoring Engine
// Maps questionnaire answers to 4 PCOS types with weighted scoring

export const PCOS_TYPES = {
  INSULIN_RESISTANT: {
    id: 'insulin_resistant',
    name: 'Insulin-Resistant PCOS',
    emoji: '🍬',
    color: '#FF8DAB',
    shortDesc: 'The most common type (~70% of cases)',
    description: 'Your symptoms suggest insulin resistance may be a key driver. Your body may struggle to use insulin efficiently, leading to elevated androgen levels.',
    tips: [
      'Focus on low-glycemic foods',
      'Strength training helps improve insulin sensitivity',
      'Consider chromium & inositol supplements',
      'Prioritize protein with every meal',
      'Regular movement after meals helps glucose control',
    ],
    workoutRec: 'Strength training, brisk walking, yoga',
    foodFocus: 'High protein, low GI carbs, healthy fats',
  },
  ADRENAL: {
    id: 'adrenal',
    name: 'Adrenal PCOS',
    emoji: '🌿',
    color: '#A97DD4',
    shortDesc: 'Driven by stress response',
    description: 'Your profile suggests elevated stress hormones (DHEA-S) may be contributing. This type is often linked to chronic stress and adrenal overactivity.',
    tips: [
      'Stress management is your #1 priority',
      'Gentle exercise — avoid overtraining',
      'Adaptogenic herbs (ashwagandha, rhodiola)',
      'Prioritize 7-9 hours of quality sleep',
      'Magnesium supplementation may help',
    ],
    workoutRec: 'Yoga, pilates, walking, swimming',
    foodFocus: 'Anti-stress foods, magnesium-rich, avoid caffeine excess',
  },
  INFLAMMATORY: {
    id: 'inflammatory',
    name: 'Inflammatory PCOS',
    emoji: '🔥',
    color: '#F96B4F',
    shortDesc: 'Driven by chronic inflammation',
    description: 'Your symptoms point toward chronic low-grade inflammation as a primary driver, which can stimulate excess androgen production.',
    tips: [
      'Anti-inflammatory diet (omega-3 rich foods)',
      'Identify food sensitivities (gluten, dairy)',
      'Turmeric and fish oil supplementation',
      'Regular moderate exercise',
      'Gut health focus — probiotics & fiber',
    ],
    workoutRec: 'Moderate intensity — swimming, cycling, dance',
    foodFocus: 'Omega-3 rich, anti-inflammatory, gut-healing foods',
  },
  POST_PILL_LEAN: {
    id: 'post_pill_lean',
    name: 'Post-Pill / Lean PCOS',
    emoji: '🌸',
    color: '#4AA3D9',
    shortDesc: 'Temporary or lean presentation',
    description: 'Your profile suggests a lean presentation or post-hormonal contraceptive adjustment. Symptoms may resolve with targeted lifestyle changes.',
    tips: [
      'Focus on nutrient-dense whole foods',
      'Zinc and vitamin B6 support hormone balance',
      'Avoid under-eating — adequate calories matter',
      'Seed cycling may support hormone rhythm',
      'Patience — this type often improves with time',
    ],
    workoutRec: 'Balanced mix — strength, cardio, flexibility',
    foodFocus: 'Nutrient-dense, adequate calories, zinc-rich foods',
  },
};

// Each question answer maps to type scores
// Format: { insulin, adrenal, inflammatory, postPill }
const SCORING = {
  q1: { // Cycle Regularity
    A: { insulin: 0, adrenal: 0, inflammatory: 0, postPill: 1 },
    B: { insulin: 3, adrenal: 2, inflammatory: 2, postPill: 1 },
    C: { insulin: 2, adrenal: 3, inflammatory: 1, postPill: 3 },
    D: { insulin: 1, adrenal: 1, inflammatory: 3, postPill: 0 },
  },
  q2: { // Skin and Hair (multi-select, scores add up)
    A: { insulin: 2, adrenal: 1, inflammatory: 3, postPill: 1 },
    B: { insulin: 3, adrenal: 2, inflammatory: 1, postPill: 0 },
    C: { insulin: 1, adrenal: 3, inflammatory: 1, postPill: 2 },
    D: { insulin: 3, adrenal: 0, inflammatory: 2, postPill: 0 },
    E: { insulin: 0, adrenal: 0, inflammatory: 0, postPill: 2 },
  },
  q3: { // Energy and Metabolic Health
    A: { insulin: 4, adrenal: 1, inflammatory: 2, postPill: 0 },
    B: { insulin: 4, adrenal: 0, inflammatory: 1, postPill: 0 },
    C: { insulin: 3, adrenal: 1, inflammatory: 2, postPill: 0 },
    D: { insulin: 0, adrenal: 1, inflammatory: 0, postPill: 3 },
  },
  q4: { // Weight Management
    A: { insulin: 4, adrenal: 1, inflammatory: 2, postPill: 0 },
    B: { insulin: 4, adrenal: 0, inflammatory: 2, postPill: 0 },
    C: { insulin: 0, adrenal: 2, inflammatory: 0, postPill: 4 },
    D: { insulin: 2, adrenal: 2, inflammatory: 1, postPill: 1 },
  },
  q5: { // Mood
    A: { insulin: 1, adrenal: 4, inflammatory: 1, postPill: 1 },
    B: { insulin: 1, adrenal: 2, inflammatory: 2, postPill: 2 },
    C: { insulin: 1, adrenal: 2, inflammatory: 3, postPill: 2 },
    D: { insulin: 0, adrenal: 0, inflammatory: 0, postPill: 2 },
  },
  q6: { // Sleep
    A: { insulin: 2, adrenal: 3, inflammatory: 2, postPill: 0 },
    B: { insulin: 1, adrenal: 4, inflammatory: 1, postPill: 0 },
    C: { insulin: 3, adrenal: 1, inflammatory: 1, postPill: 0 },
    D: { insulin: 0, adrenal: 0, inflammatory: 0, postPill: 3 },
  },
  q7: { // Health Goal (lighter scoring — preference not symptom)
    A: { insulin: 2, adrenal: 0, inflammatory: 1, postPill: 0 },
    B: { insulin: 1, adrenal: 1, inflammatory: 1, postPill: 2 },
    C: { insulin: 1, adrenal: 0, inflammatory: 0, postPill: 2 },
    D: { insulin: 0, adrenal: 1, inflammatory: 2, postPill: 1 },
  },
  q8: { // Physical Activity
    A: { insulin: 2, adrenal: 1, inflammatory: 2, postPill: 0 },
    B: { insulin: 0, adrenal: 2, inflammatory: 0, postPill: 1 },
    C: { insulin: 0, adrenal: 1, inflammatory: 1, postPill: 1 },
    D: { insulin: 0, adrenal: 0, inflammatory: 0, postPill: 2 },
  },
  q9: { // Diagnosis History
    A: { insulin: 1, adrenal: 1, inflammatory: 1, postPill: 2 },
    B: { insulin: 2, adrenal: 2, inflammatory: 2, postPill: 0 },
    C: { insulin: 1, adrenal: 1, inflammatory: 1, postPill: 2 },
    D: { insulin: 1, adrenal: 1, inflammatory: 1, postPill: 1 },
  },
  q10: { // Stress
    A: { insulin: 0, adrenal: 0, inflammatory: 0, postPill: 2 },
    B: { insulin: 1, adrenal: 2, inflammatory: 1, postPill: 1 },
    C: { insulin: 1, adrenal: 4, inflammatory: 2, postPill: 0 },
    D: { insulin: 1, adrenal: 5, inflammatory: 2, postPill: 0 },
  },
};

export function analyzePCOS(answers) {
  const scores = { insulin: 0, adrenal: 0, inflammatory: 0, postPill: 0 };

  Object.entries(answers).forEach(([questionKey, answer]) => {
    const qScoring = SCORING[questionKey];
    if (!qScoring) return;

    // Handle multi-select (q2)
    if (Array.isArray(answer)) {
      answer.forEach((a) => {
        const s = qScoring[a];
        if (s) {
          scores.insulin += s.insulin;
          scores.adrenal += s.adrenal;
          scores.inflammatory += s.inflammatory;
          scores.postPill += s.postPill;
        }
      });
    } else {
      const s = qScoring[answer];
      if (s) {
        scores.insulin += s.insulin;
        scores.adrenal += s.adrenal;
        scores.inflammatory += s.inflammatory;
        scores.postPill += s.postPill;
      }
    }
  });

  const total = scores.insulin + scores.adrenal + scores.inflammatory + scores.postPill;
  const percentages = {
    insulin: total > 0 ? Math.round((scores.insulin / total) * 100) : 25,
    adrenal: total > 0 ? Math.round((scores.adrenal / total) * 100) : 25,
    inflammatory: total > 0 ? Math.round((scores.inflammatory / total) * 100) : 25,
    postPill: total > 0 ? Math.round((scores.postPill / total) * 100) : 25,
  };

  // Determine primary and secondary types
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const typeMap = {
    insulin: 'INSULIN_RESISTANT',
    adrenal: 'ADRENAL',
    inflammatory: 'INFLAMMATORY',
    postPill: 'POST_PILL_LEAN',
  };

  return {
    scores,
    percentages,
    primaryType: typeMap[sorted[0][0]],
    secondaryType: typeMap[sorted[1][0]],
    primaryInfo: PCOS_TYPES[typeMap[sorted[0][0]]],
    secondaryInfo: PCOS_TYPES[typeMap[sorted[1][0]]],
  };
}

export const QUESTIONS = [
  {
    id: 'q1',
    title: 'Cycle Regularity',
    question: 'How would you describe your menstrual cycle over the last six months?',
    multiSelect: false,
    options: [
      { key: 'A', text: 'Regular (21–35 days)', emoji: '📅' },
      { key: 'B', text: 'Irregular (Cycles vary significantly in length)', emoji: '🔄' },
      { key: 'C', text: 'Absent (No period for 3+ months)', emoji: '⏸️' },
      { key: 'D', text: 'Frequent (Cycles shorter than 21 days)', emoji: '⏩' },
    ],
  },
  {
    id: 'q2',
    title: 'Skin & Hair Changes',
    question: 'Are you experiencing any of the following physical symptoms?',
    multiSelect: true,
    options: [
      { key: 'A', text: 'Persistent acne (jawline/chest/back)', emoji: '😣' },
      { key: 'B', text: 'Excess hair growth (face, chin, or stomach)', emoji: '🪒' },
      { key: 'C', text: 'Thinning hair on the scalp', emoji: '💇‍♀️' },
      { key: 'D', text: 'Darkened patches of skin', emoji: '🫶' },
      { key: 'E', text: 'None of the above', emoji: '✨' },
    ],
  },
  {
    id: 'q3',
    title: 'Energy & Metabolism',
    question: 'How do you feel after eating a meal high in carbohydrates or sugar?',
    multiSelect: false,
    options: [
      { key: 'A', text: 'Intense energy crash or "brain fog"', emoji: '😵‍💫' },
      { key: 'B', text: 'Extreme cravings for more sugar', emoji: '🍭' },
      { key: 'C', text: 'Constant hunger even after eating', emoji: '😋' },
      { key: 'D', text: 'No noticeable change', emoji: '🙂' },
    ],
  },
  {
    id: 'q4',
    title: 'Weight Management',
    question: 'Which statement best describes your experience with weight?',
    multiSelect: false,
    options: [
      { key: 'A', text: 'Difficulty losing weight despite diet and exercise', emoji: '⚖️' },
      { key: 'B', text: 'Rapid weight gain, particularly around the midsection', emoji: '📊' },
      { key: 'C', text: 'Stable weight / Lean PCOS', emoji: '🧘‍♀️' },
      { key: 'D', text: 'Frequent fluctuations', emoji: '📈' },
    ],
  },
  {
    id: 'q5',
    title: 'Mood & Wellbeing',
    question: 'Have you noticed consistent patterns in your mood related to your cycle?',
    multiSelect: false,
    options: [
      { key: 'A', text: 'Heightened anxiety or irritability', emoji: '😰' },
      { key: 'B', text: 'Feelings of depression or low motivation', emoji: '😔' },
      { key: 'C', text: 'Significant mood swings (PMDD symptoms)', emoji: '🎭' },
      { key: 'D', text: 'Generally stable mood', emoji: '😊' },
    ],
  },
  {
    id: 'q6',
    title: 'Sleep Quality',
    question: 'How would you rate your sleep and morning energy levels?',
    multiSelect: false,
    options: [
      { key: 'A', text: 'I wake up feeling exhausted regardless of sleep time', emoji: '😴' },
      { key: 'B', text: 'I struggle with insomnia or staying asleep', emoji: '🌙' },
      { key: 'C', text: 'I experience heavy snoring or interrupted breathing', emoji: '💤' },
      { key: 'D', text: 'I sleep well and feel rested', emoji: '🌅' },
    ],
  },
  {
    id: 'q7',
    title: 'Your Health Goal',
    question: 'What is your main objective for using this app?',
    multiSelect: false,
    options: [
      { key: 'A', text: 'Managing weight and metabolism', emoji: '💪' },
      { key: 'B', text: 'Regulating my period', emoji: '🩸' },
      { key: 'C', text: 'Improving fertility / Conception', emoji: '🤱' },
      { key: 'D', text: 'Reducing skin and hair symptoms', emoji: '✨' },
    ],
  },
  {
    id: 'q8',
    title: 'Physical Activity',
    question: 'What does your current weekly movement look like?',
    multiSelect: false,
    options: [
      { key: 'A', text: 'Sedentary (Minimal intentional movement)', emoji: '🛋️' },
      { key: 'B', text: 'Low impact (Walking, Yoga, Pilates)', emoji: '🚶‍♀️' },
      { key: 'C', text: 'High intensity (HIIT, Heavy lifting, Running)', emoji: '🏋️‍♀️' },
      { key: 'D', text: 'Highly active (5+ days a week)', emoji: '🔥' },
    ],
  },
  {
    id: 'q9',
    title: 'Diagnosis History',
    question: 'Have you been formally diagnosed with PCOS by a healthcare professional?',
    multiSelect: false,
    options: [
      { key: 'A', text: 'Yes, recently (within the last year)', emoji: '📋' },
      { key: 'B', text: 'Yes, I have been managing it for years', emoji: '📚' },
      { key: 'C', text: 'No, but I suspect I have it based on symptoms', emoji: '🤔' },
      { key: 'D', text: 'I\'m currently undergoing testing', emoji: '🔬' },
    ],
  },
  {
    id: 'q10',
    title: 'Stress Levels',
    question: 'On a typical day, how would you rank your stress levels?',
    multiSelect: false,
    options: [
      { key: 'A', text: 'Low (Easily managed)', emoji: '😌' },
      { key: 'B', text: 'Moderate (Common daily stressors)', emoji: '😊' },
      { key: 'C', text: 'High (Feeling overwhelmed frequently)', emoji: '😫' },
      { key: 'D', text: 'Chronic (Stress feels constant and unmanageable)', emoji: '🥺' },
    ],
  },
];
