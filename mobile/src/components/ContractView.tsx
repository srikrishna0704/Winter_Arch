import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING } from '../constants/theme';
import { useApp } from '../store/AppContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ContractView: React.FC<Props> = ({ visible, onClose }) => {
  const { arc, user } = useApp();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.headerBadge}>OFFICIAL CONTRACT</Text>
            <Text style={styles.title}>MY 90-DAY WINTER ARC COMMITMENT</Text>
            <Text style={styles.subtext}>"90 Days. One Version of You."</Text>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.label}>PRIMARY GOAL:</Text>
              <Text style={styles.value}>{arc?.mainGoal || 'Full-Stack Transformation & Peak Athletic Discipline'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>THE REASON:</Text>
              <Text style={styles.value}>{arc?.reason || 'Eliminate excuses, execute non-negotiables daily, emerge unbroken.'}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.label}>THREE POWERS:</Text>
              <View style={styles.powersRow}>
                <View style={[styles.powerItem, { borderColor: COLORS.mind }]}>
                  <Text style={[styles.powerText, { color: COLORS.mind }]}>MIND</Text>
                </View>
                <View style={[styles.powerItem, { borderColor: COLORS.body }]}>
                  <Text style={[styles.powerText, { color: COLORS.body }]}>BODY</Text>
                </View>
                <View style={[styles.powerItem, { borderColor: COLORS.future }]}>
                  <Text style={[styles.powerText, { color: COLORS.future }]}>FUTURE</Text>
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfCol}>
                <Text style={styles.label}>START DATE:</Text>
                <Text style={styles.valueSmall}>{arc?.startDate || 'Oct 1, 2026'}</Text>
              </View>
              <View style={styles.halfCol}>
                <Text style={styles.label}>END DATE:</Text>
                <Text style={styles.valueSmall}>{arc?.endDate || 'Dec 30, 2026'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.signatureBox}>
              <Text style={styles.label}>DIGITAL SIGNATURE:</Text>
              <Text style={styles.signatureText}>{arc?.signature || user?.name || 'Alex Vance'}</Text>
              <Text style={styles.signedTag}>VERIFIED & LOCKED</Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>CLOSE CONTRACT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md
  },
  card: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: SPACING.md
  },
  content: {
    paddingBottom: SPACING.md
  },
  headerBadge: {
    color: COLORS.iceAccent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4
  },
  title: {
    color: COLORS.primaryText,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center'
  },
  subtext: {
    color: COLORS.secondaryText,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: SPACING.md
  },
  section: {
    marginBottom: SPACING.md
  },
  label: {
    color: COLORS.mutedText,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4
  },
  value: {
    color: COLORS.primaryText,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20
  },
  valueSmall: {
    color: COLORS.primaryText,
    fontSize: 12,
    fontWeight: '600'
  },
  powersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  powerItem: {
    flex: 1,
    borderWidth: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 3,
    backgroundColor: COLORS.secondarySurface
  },
  powerText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfCol: {
    flex: 1
  },
  signatureBox: {
    backgroundColor: COLORS.secondarySurface,
    padding: SPACING.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center'
  },
  signatureText: {
    fontFamily: 'Courier New',
    color: COLORS.iceAccent,
    fontSize: 22,
    fontStyle: 'italic',
    fontWeight: '700',
    marginVertical: 4
  },
  signedTag: {
    color: COLORS.success,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1
  },
  closeBtn: {
    backgroundColor: COLORS.secondarySurface,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.xs
  },
  closeBtnText: {
    color: COLORS.primaryText,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  }
});
