import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../lib/theme';

export function Toast({ visible, message, type = 'success' }: { visible: boolean; message: string; type?: 'success' | 'error' | 'info' }) {
  const anim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: visible ? 0 : -120,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [visible]);

  const tint = type === 'success' ? theme.mint : type === 'error' ? theme.danger : theme.lavender;
  const icon = type === 'success' ? 'checkmark-circle' : type === 'error' ? 'alert-circle' : 'information-circle';

  return (
    <Animated.View style={[styles.toast, { transform: [{ translateY: anim }] }]} pointerEvents="none">
      <View style={[styles.iconBox, { backgroundColor: tint }]}>
        <Ionicons name={icon as any} size={18} color={theme.bg} />
      </View>
      <Text style={styles.msg}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 100,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  iconBox: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  msg: { color: theme.text, fontSize: 14, fontWeight: '500', flex: 1 },
});
