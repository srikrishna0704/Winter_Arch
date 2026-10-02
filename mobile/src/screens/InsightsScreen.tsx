import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { apiRequest } from '../services/api';
import { Insight } from '../types';

export const InsightsScreen: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [dailyReview, setDailyReview] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/insights');
      if (res.success && res.insights) {
        setInsights(res.insights);
      }

      const revRes = await apiRequest('/insights/daily-review');
      if (revRes.success && revRes.review) {
        setDailyReview(revRes.review);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>AI PERFORMANCE INSIGHTS</Text>
          <Text style={styles.subtitle}>Empirical pattern detection calculated from your historical data</Text>
        </View>

        {/* AI Daily Review Card */}
        {dailyReview && (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewBadge}>DAY {dailyReview.dayNumber} AI DAILY REVIEW</Text>
              <Text style={styles.reviewScore}>SCORE: {dailyReview.score}/100</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>WHAT WENT WELL</Text>
              <Text style={styles.reviewValue}>{dailyReview.whatWentWell}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>WHAT FAILED / FRICTION</Text>
              <Text style={styles.reviewValue}>{dailyReview.whatFailed}</Text>
            </View>

            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>BEHAVIORAL PATTERN</Text>
              <Text style={styles.reviewValue}>{dailyReview.pattern}</Text>
            </View>

            <View style={[styles.reviewSection, styles.priorityBox]}>
              <Text style={styles.priorityLabel}>TOMORROW'S PRIORITY</Text>
              <Text style={styles.priorityValue}>{dailyReview.tomorrowPriority}</Text>
            </View>
          </View>
        )}

        {/* Detected Patterns & Warnings */}
        <View style={styles.patternsHeader}>
          <Text style={styles.patternsTitle}>DETECTED PATTERNS</Text>
          <TouchableOpacity onPress={loadInsights}>
            <Text style={styles.refreshBtnText}>🔄 RE-ANALYZES</Text>
          </TouchableOpacity>
        </View>

        {insights.length === 0 && !loading && (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Not enough log history yet. Keep tracking daily to unlock deep behavioral insights.</Text>
          </View>
        )}

        {insights.map((item) => (
          <View key={item.id} style={styles.insightCard}>
            <View style={styles.insightTop}>
              <Text style={styles.insightType}>{(item.type || 'PATTERN').toUpperCase()}</Text>
              <Text style={styles.insightTitle}>{item.title}</Text>
            </View>
            <Text style={styles.insightContent}>{item.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingBottom: SPACING.xxl
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 20,
    fontWeight: '800'
  },
  subtitle: {
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 2
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.iceAccent,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  reviewBadge: {
    color: COLORS.iceAccent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  reviewScore: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '800'
  },
  reviewSection: {
    marginBottom: SPACING.sm
  },
  reviewLabel: {
    color: COLORS.mutedText,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2
  },
  reviewValue: {
    color: COLORS.primaryText,
    fontSize: 13,
    lineHeight: 18
  },
  priorityBox: {
    backgroundColor: COLORS.secondarySurface,
    padding: SPACING.sm,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
    marginTop: 4
  },
  priorityLabel: {
    color: COLORS.warning,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1
  },
  priorityValue: {
    color: COLORS.primaryText,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  patternsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm
  },
  patternsTitle: {
    color: COLORS.secondaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  refreshBtnText: {
    color: COLORS.iceAccent,
    fontSize: 10,
    fontWeight: '800'
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    marginHorizontal: SPACING.md,
    borderRadius: 12
  },
  emptyText: {
    color: COLORS.secondaryText,
    fontSize: 13,
    textAlign: 'center'
  },
  insightCard: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm
  },
  insightTop: {
    marginBottom: 6
  },
  insightType: {
    color: COLORS.iceAccent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1
  },
  insightTitle: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2
  },
  insightContent: {
    color: COLORS.secondaryText,
    fontSize: 12,
    lineHeight: 18
  }
});
