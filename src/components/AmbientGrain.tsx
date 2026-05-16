import { StyleSheet, View } from 'react-native';

export function AmbientGrain() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.veil} />
    </View>
  );
}

const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.28,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
});
