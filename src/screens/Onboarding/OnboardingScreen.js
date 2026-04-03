import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Image,
  StyleSheet, Dimensions, Animated,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, Radius, Shadows, Spacing } from '../../theme/tokens';
import { QUESTIONS, analyzePCOS } from '../../utils/pcosEngine';
import { KEYS, setData } from '../../storage/storage';

const { width } = Dimensions.get('window');

export default function OnboardingScreen({ onComplete }) {
  const [step, setStep] = useState('welcome'); // welcome | questions | analyzing | result
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const animateTransition = (callback) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      callback();
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  const handleAnswer = (questionId, key, multiSelect) => {
    setAnswers(prev => {
      if (multiSelect) {
        const current = prev[questionId] || [];
        if (key === 'E') return { ...prev, [questionId]: ['E'] };
        const filtered = current.filter(k => k !== 'E');
        const updated = filtered.includes(key) ? filtered.filter(k => k !== key) : [...filtered, key];
        return { ...prev, [questionId]: updated };
      }
      return { ...prev, [questionId]: key };
    });
  };

  const canProceed = () => {
    const q = QUESTIONS[currentQ];
    const answer = answers[q.id];
    if (q.multiSelect) return answer && answer.length > 0;
    return !!answer;
  };

  const nextQuestion = () => {
    if (currentQ < QUESTIONS.length - 1) {
      animateTransition(() => setCurrentQ(currentQ + 1));
    } else {
      startAnalysis();
    }
  };

  const prevQuestion = () => {
    if (currentQ > 0) {
      animateTransition(() => setCurrentQ(currentQ - 1));
    }
  };

  const startAnalysis = async () => {
    setStep('analyzing');
    const analysisResult = analyzePCOS(answers);
    await setData(KEYS.PCOS_PROFILE, {
      answers,
      result: {
        primaryType: analysisResult.primaryType,
        secondaryType: analysisResult.secondaryType,
        scores: analysisResult.scores,
        percentages: analysisResult.percentages,
      },
      analyzedAt: new Date().toISOString(),
    });
    setTimeout(() => {
      setResult(analysisResult);
      setStep('result');
    }, 2500);
  };

  const finishOnboarding = async () => {
    await setData(KEYS.ONBOARDING_COMPLETE, true);
    onComplete();
  };

  if (step === 'welcome') {
    return (
      <View style={styles.container}>
        <View style={styles.welcomeContent}>
          <View style={styles.flowerRow}>
            <Text style={styles.flower}>🌸</Text>
            <Text style={[styles.flower, { fontSize: 32 }]}>🌺</Text>
            <Text style={styles.flower}>🌸</Text>
          </View>
          <Image source={require('../../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.welcomeTitle}>Welcome to Hormonia</Text>
          <Text style={styles.welcomeSubtitle}>
            Your personal PCOS companion 🎀{'\n'}
            Let's understand your body better together
          </Text>

          <View style={styles.featureList}>
            {[
              { emoji: '🌙', text: 'Track your cycle & symptoms' },
              { emoji: '🍽️', text: 'Fixed meal schedule & nutrition' },
              { emoji: '💪', text: 'Workout logging & progress' },
              { emoji: '👟', text: 'Daily step tracking' },
              { emoji: '📝', text: 'Mental health journaling' },
            ].map((f, i) => (
              <BlurView tint="light" intensity={60} key={i} style={styles.featureRowGlass}>
                <Text style={{ fontSize: 20 }}>{f.emoji}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </BlurView>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, Shadows.glow]}
            onPress={() => animateTransition(() => setStep('questions'))}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Let's Get Started 🌸</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimerGlass}>
            ⚕️ This app provides wellness insights, not medical diagnoses.{'\n'}
            Always consult your healthcare provider.
          </Text>
        </View>
      </View>
    );
  }

  if (step === 'questions') {
    const q = QUESTIONS[currentQ];
    const selectedAnswer = answers[q.id];

    return (
      <View style={styles.container}>
        <View style={styles.questionHeader}>
          <TouchableOpacity onPress={prevQuestion} disabled={currentQ === 0}>
            <Text style={[styles.navBtn, currentQ === 0 && { opacity: 0.3 }]}>‹</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.questionCount}>{currentQ + 1} of {QUESTIONS.length}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }]} />
            </View>
          </View>
          <View style={{ width: 30 }} />
        </View>

        <Animated.View style={[styles.questionContent, { opacity: fadeAnim }]}>
          <Text style={styles.questionEmoji}>🌸</Text>
          <Text style={styles.questionTitle}>{q.title}</Text>
          <Text style={styles.questionText}>{q.question}</Text>
          {q.multiSelect && (
            <Text style={styles.multiSelectHint}>Select all that apply</Text>
          )}

          <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
            {q.options.map((opt) => {
              const isSelected = q.multiSelect
                ? (selectedAnswer || []).includes(opt.key)
                : selectedAnswer === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                  onPress={() => handleAnswer(q.id, opt.key, q.multiSelect)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {opt.text}
                  </Text>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        <TouchableOpacity
          style={[styles.primaryBtn, Shadows.glow, !canProceed() && styles.btnDisabled]}
          onPress={nextQuestion}
          disabled={!canProceed()}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>
            {currentQ === QUESTIONS.length - 1 ? 'Analyze My Profile 🔮' : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'analyzing') {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ fontSize: 48, marginBottom: 20 }}>🔮</Text>
        <Text style={styles.analyzingTitle}>Analyzing your profile...</Text>
        <Text style={styles.analyzingSubtitle}>
          Our engine is personalizing{'\n'}your experience 🌸
        </Text>
        <View style={styles.loadingDots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, { opacity: 0.4 + (i * 0.2) }]} />
          ))}
        </View>
      </View>
    );
  }

  if (step === 'result' && result) {
    const primary = result.primaryInfo;
    const secondary = result.secondaryInfo;
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.resultContent}>
        <Text style={styles.resultEmoji}>{primary.emoji}</Text>
        <Text style={styles.resultTitle}>Your PCOS Profile</Text>
        <Text style={styles.resultSubtitle}>{primary.shortDesc}</Text>

        <View style={[styles.resultCard, { borderLeftColor: primary.color, borderLeftWidth: 4 }]}>
          <Text style={styles.resultCardTitle}>Primary: {primary.name}</Text>
          <Text style={styles.resultCardDesc}>{primary.description}</Text>
        </View>

        <View style={[styles.resultCard, { borderLeftColor: secondary.color, borderLeftWidth: 4, opacity: 0.85 }]}>
          <Text style={[styles.resultCardTitle, { fontSize: 14 }]}>Secondary: {secondary.name} {secondary.emoji}</Text>
          <Text style={[styles.resultCardDesc, { fontSize: 12 }]}>{secondary.shortDesc}</Text>
        </View>

        {/* Score breakdown */}
        <View style={styles.scoresRow}>
          {Object.entries(result.percentages).map(([key, pct]) => {
            const names = { insulin: 'Insulin', adrenal: 'Adrenal', inflammatory: 'Inflam.', postPill: 'Post-Pill' };
            const colors = { insulin: Colors.pink400, adrenal: Colors.lavender400, inflammatory: Colors.coral500, postPill: Colors.sky500 };
            return (
              <View key={key} style={styles.scoreItem}>
                <View style={[styles.scoreBar, { height: `${Math.max(pct, 8)}%`, backgroundColor: colors[key] }]} />
                <Text style={styles.scoreLabel}>{names[key]}</Text>
                <Text style={styles.scorePct}>{pct}%</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.tipsTitle}>🌿 Tailored Tips</Text>
        {primary.tips.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <Text style={styles.tipBullet}>🌸</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}

        <View style={[styles.resultCard, { backgroundColor: Colors.mint50 }]}>
          <Text style={styles.resultCardTitle}>🏋️ Recommended Activity</Text>
          <Text style={styles.resultCardDesc}>{primary.workoutRec}</Text>
        </View>

        <View style={[styles.resultCard, { backgroundColor: Colors.cream100 }]}>
          <Text style={styles.resultCardTitle}>🥗 Food Focus</Text>
          <Text style={styles.resultCardDesc}>{primary.foodFocus}</Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, Shadows.glow, { marginTop: 20 }]}
          onPress={finishOnboarding}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Start Using Hormonia 🎀</Text>
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { marginBottom: 40 }]}>
          ⚕️ These insights are based on your self-reported symptoms.{'\n'}
          Please consult a healthcare professional for medical advice.
        </Text>
      </ScrollView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
  },
  welcomeContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
  },
  flowerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  flower: {
    fontSize: 24,
    opacity: 0.7,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontWeight: '600',
  },
  featureList: {
    width: '100%',
    gap: 10,
    marginBottom: 28,
  },
  featureRowGlass: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderWidth: 1.5,
    padding: 14,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  primaryBtn: {
    backgroundColor: Colors.pink500,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: Radius.full,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  disclaimerGlass: {
    fontSize: 11,
    color: Colors.textPrimary, // better contrast against bg
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontWeight: '600',
  },
  // Question Screen
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navBtn: {
    fontSize: 32,
    color: Colors.pink500,
    fontWeight: '300',
    width: 30,
  },
  questionCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  progressBar: {
    width: 120,
    height: 4,
    backgroundColor: Colors.pink100,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.pink500,
    borderRadius: 2,
  },
  questionContent: {
    flex: 1,
  },
  questionEmoji: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 6,
  },
  questionText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  multiSelectHint: {
    fontSize: 12,
    color: Colors.pink500,
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsList: {
    flex: 1,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.cardBg,
    borderWidth: 2,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  optionCardSelected: {
    borderColor: Colors.pink500,
    backgroundColor: Colors.pink50,
  },
  optionEmoji: {
    fontSize: 22,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  optionTextSelected: {
    color: Colors.pink700,
    fontWeight: '600',
  },
  checkMark: {
    fontSize: 16,
    color: Colors.pink500,
    fontWeight: '700',
  },
  // Analyzing
  analyzingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  analyzingSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.pink400,
  },
  // Result
  resultContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  resultCard: {
    width: '100%',
    backgroundColor: Colors.cardBg,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
    ...Shadows.sm,
  },
  resultCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  resultCardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  scoresRow: {
    flexDirection: 'row',
    width: '100%',
    height: 120,
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    marginVertical: 16,
    paddingHorizontal: 10,
  },
  scoreItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  scoreBar: {
    width: 24,
    borderRadius: 6,
    minHeight: 8,
  },
  scoreLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  scorePct: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    alignSelf: 'flex-start',
    marginBottom: 12,
    marginTop: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  tipBullet: {
    fontSize: 14,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
