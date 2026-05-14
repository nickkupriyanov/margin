import { StyleSheet, View } from 'react-native';

export function AmbientGrain() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.veil} />
      <View style={styles.lineOne} />
      <View style={styles.lineTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  veil: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.28,
    backgroundColor: 'rgba(255,255,255,0.025)',
  },
  lineOne: {
    backgroundColor: 'rgba(95, 67, 43, 0.045)',
    height: 1,
    left: 24,
    position: 'absolute',
    right: 24,
    top: 136,
  },
  lineTwo: {
    backgroundColor: 'rgba(95, 67, 43, 0.035)',
    bottom: 126,
    height: 1,
    left: 42,
    position: 'absolute',
    right: 42,
  },
});
