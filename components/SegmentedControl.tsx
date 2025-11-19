
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '@/styles/commonStyles';

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
}

export function SegmentedControl({ segments, selectedIndex, onIndexChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {segments.map((segment, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.segment,
            index === 0 && styles.firstSegment,
            index === segments.length - 1 && styles.lastSegment,
            selectedIndex === index && styles.selectedSegment,
          ]}
          onPress={() => {
            console.log('Segment selected:', segment);
            onIndexChange(index);
          }}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              selectedIndex === index && styles.selectedSegmentText,
            ]}
          >
            {segment}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: 10,
    padding: 2,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firstSegment: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  lastSegment: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  selectedSegment: {
    backgroundColor: colors.card,
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  selectedSegmentText: {
    color: colors.primary,
    fontWeight: '600',
  },
});
