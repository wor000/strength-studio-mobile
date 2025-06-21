import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Play, 
  TrendingUp, 
  Target, 
  Clock,
  ChevronRight,
  Flame
} from 'lucide-react-native';
import { useGym } from '@/src/contexts/GymContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { getTodayRoutine, workoutSessions } = useGym();
  const todayRoutine = getTodayRoutine();
  
  // Mock data for demonstration
  const weeklyStats = {
    workoutsCompleted: 4,
    totalWorkouts: 6,
    caloriesBurned: 1250,
    averageWorkoutTime: 45,
  };

  const quickActions = [
    {
      title: 'Start Today\'s Workout',
      subtitle: todayRoutine?.name || 'No workout scheduled',
      icon: Play,
      color: '#6366f1',
      gradient: ['#6366f1', '#8b5cf6'],
      disabled: !todayRoutine,
    },
    {
      title: 'View Progress',
      subtitle: 'Track your improvements',
      icon: TrendingUp,
      color: '#10b981',
      gradient: ['#10b981', '#059669'],
    },
    {
      title: 'Set Goals',
      subtitle: 'Define your targets',
      icon: Target,
      color: '#f59e0b',
      gradient: ['#f59e0b', '#d97706'],
    },
  ];

  const recentWorkouts = workoutSessions.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.subtitle}>Ready to crush your goals?</Text>
          </View>
          <View style={styles.streakContainer}>
            <Flame size={20} color="#f59e0b" />
            <Text style={styles.streakText}>7 day streak</Text>
          </View>
        </View>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroOverlay}
          >
            <Text style={styles.heroTitle}>Transform Your Body</Text>
            <Text style={styles.heroSubtitle}>Strength • Endurance • Confidence</Text>
          </LinearGradient>
        </View>

        {/* Weekly Stats */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{weeklyStats.workoutsCompleted}/{weeklyStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{weeklyStats.caloriesBurned}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{weeklyStats.averageWorkoutTime}m</Text>
              <Text style={styles.statLabel}>Avg Time</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, action.disabled && styles.actionCardDisabled]}
              disabled={action.disabled}
            >
              <LinearGradient
                colors={action.disabled ? ['#f3f4f6', '#e5e7eb'] : action.gradient}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.actionContent}>
                  <View style={styles.actionIcon}>
                    <action.icon 
                      size={24} 
                      color={action.disabled ? '#9ca3af' : '#ffffff'} 
                    />
                  </View>
                  <View style={styles.actionText}>
                    <Text style={[
                      styles.actionTitle,
                      action.disabled && styles.actionTitleDisabled
                    ]}>
                      {action.title}
                    </Text>
                    <Text style={[
                      styles.actionSubtitle,
                      action.disabled && styles.actionSubtitleDisabled
                    ]}>
                      {action.subtitle}
                    </Text>
                  </View>
                  <ChevronRight 
                    size={20} 
                    color={action.disabled ? '#9ca3af' : '#ffffff'} 
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View style={styles.recentContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentWorkouts.length > 0 ? (
            recentWorkouts.map((session, index) => (
              <View key={session.id} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <Clock size={16} color="#6366f1" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>Workout Completed</Text>
                  <Text style={styles.activityDate}>
                    {new Date(session.date).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.activityDuration}>
                  {session.end_time ? 
                    Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 60000) + 'm'
                    : 'In progress'
                  }
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No recent workouts</Text>
              <Text style={styles.emptyStateSubtext}>Start your first workout to see activity here</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#d97706',
    marginLeft: 4,
  },
  heroContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#ffffff',
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 4,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  actionGradient: {
    padding: 20,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
  actionTitleDisabled: {
    color: '#6b7280',
  },
  actionSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#ffffff',
    opacity: 0.9,
    marginTop: 2,
  },
  actionSubtitleDisabled: {
    color: '#9ca3af',
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
  },
  activityDate: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  activityDuration: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
});