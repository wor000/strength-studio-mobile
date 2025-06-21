import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <AlertTriangle size={64} color="#6b7280" />
        <Text style={styles.title}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 24,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
});