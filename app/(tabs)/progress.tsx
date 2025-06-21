import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  TrendingUp,
  Calendar,
  Target,
  Award,
  ChevronDown,
  Flame,
  Clock,
  Dumbbell
} from 'lucide-react-native';
import { useGym } from '@/src/contexts/GymContext';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const { workoutSessions, routines } = useGym();
  const [selectedPeriod, setSelectedPeriod] = useState('This Week');

  const periods = ['This Week', 'This Month', 'Last 3 Months', 'This Year'];

  // Calculate stats
  const completedWorkouts = workoutSessions.filter(session => session.end_time).length;
  const totalWorkoutTime = workoutSessions.reduce((total, session) => {
    if (session.end_time) {
      const duration = new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
      return total + Math.round(duration / 60000); // Convert to minutes
    }
    return total;
  }, 0);

  const averageWorkoutTime = completedWorkouts > 0 ? Math.round(totalWorkoutTime / completedWorkouts) : 0;
  const currentStreak = 7; // Mock data
  const personalBests = 3; // Mock data

  const weeklyData = [
    { day: 'Mon', workouts: 1, duration: 45 },
    { day: 'Tue', workouts: 0, duration: 0 },
    { day: 'Wed', workouts: 1, duration: 52 },
    { day: 'Thu', workouts: 0, duration: 0 },
    { day: 'Fri', workouts: 1, duration: 38 },
    { day: 'Sat', workouts: 1, duration: 60 },
    { day: 'Sun', workouts: 0, duration: 0 },
  ];

  const achievements = [
    {
      title: 'First Workout',
      description: 'Completed your first workout',
      icon: '🎯',
      earned: true,
      date: '2 weeks ago'
    },
    {
      title: 'Week Warrior',
      description: 'Completed 5 workouts in a week',
      icon: '🔥',
      earned: true,
      date: '1 week ago'
    },
    {
      title: 'Consistency King',
      description: 'Workout 7 days in a row',
      icon: '👑',
      earned: true,
      date: '3 days ago'
    },
    {
      title: 'Century Club',
      description: 'Complete 100 workouts',
      icon: '💯',
      earned: false,
      progress: 23
    },
  ];

  const maxWorkouts = Math.max(...weeklyData.map(d => d.workouts), 1);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progress</Text>
          <TouchableOpacity style={styles.periodSelector}>
            <Text style={styles.periodText}>{selectedPeriod}</Text>
            <ChevronDown size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Dumbbell size={24} color="#6366f1" />
              </View>
              <Text style={styles.statNumber}>{completedWorkouts}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Clock size={24} color="#10b981" />
              </View>
              <Text style={styles.statNumber}>{totalWorkoutTime}m</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <TrendingUp size={24} color="#f59e0b" />
              </View>
              <Text style={styles.statNumber}>{averageWorkoutTime}m</Text>
              <Text style={styles.statLabel}>Avg Time</Text>
            </View>
            
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Flame size={24} color="#ef4444" />
              </View>
              <Text style={styles.statNumber}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Weekly Activity</Text>
          <View style={styles.chart}>
            {weeklyData.map((data, index) => (
              <View key={index} style={styles.chartBar}>
                <View style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: (data.workouts / maxWorkouts) * 80,
                        backgroundColor: data.workouts > 0 ? '#6366f1' : '#e5e7eb',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.chartLabel}>{data.day}</Text>
                {data.workouts > 0 && (
                  <Text style={styles.chartValue}>{data.duration}m</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.goalsContainer}>
          <Text style={styles.sectionTitle}>Goals</Text>
          
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIcon}>
                <Target size={20} color="#6366f1" />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>Weekly Workout Goal</Text>
                <Text style={styles.goalSubtitle}>4 of 5 workouts completed</Text>
              </View>
              <Text style={styles.goalPercentage}>80%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '80%' }]} />
            </View>
          </View>

          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIcon}>
                <Clock size={20} color="#10b981" />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalTitle}>Monthly Time Goal</Text>
                <Text style={styles.goalSubtitle}>12 of 20 hours completed</Text>
              </View>
              <Text style={styles.goalPercentage}>60%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%', backgroundColor: '#10b981' }]} />
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achievementsContainer}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          {achievements.map((achievement, index) => (
            <View key={index} style={[
              styles.achievementCard,
              !achievement.earned && styles.achievementCardLocked
            ]}>
              <View style={styles.achievementIcon}>
                <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
              </View>
              <View style={styles.achievementContent}>
                <Text style={[
                  styles.achievementTitle,
                  !achievement.earned && styles.achievementTitleLocked
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  styles.achievementDescription,
                  !achievement.earned && styles.achievementDescriptionLocked
                ]}>
                  {achievement.description}
                </Text>
                {achievement.earned ? (
                  <Text style={styles.achievementDate}>Earned {achievement.date}</Text>
                ) : (
                  <View style={styles.achievementProgress}>
                    <Text style={styles.achievementProgressText}>
                      Progress: {achievement.progress}/100
                    </Text>
                    <View style={styles.achievementProgressBar}>
                      <View style={[
                        styles.achievementProgressFill,
                        { width: `${achievement.progress}%` }
                      ]} />
                    </View>
                  </View>
                )}
              </View>
              {achievement.earned && (
                <View style={styles.achievementBadge}>
                  <Award size={16} color="#10b981" />
                </View>
              )}
            </View>
          ))}
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
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  periodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  periodText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
    marginRight: 4,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: (width - 60) / 2,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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
  chartContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  chartBar: {
    alignItems: 'center',
    flex: 1,
  },
  barContainer: {
    height: 80,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 4,
  },
  chartValue: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#6366f1',
  },
  goalsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  goalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1f2937',
  },
  goalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  goalPercentage: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#6366f1',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 4,
  },
  achievementsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achievementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  achievementTitleLocked: {
    color: '#9ca3af',
  },
  achievementDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  achievementDescriptionLocked: {
    color: '#d1d5db',
  },
  achievementDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#10b981',
    marginTop: 4,
  },
  achievementProgress: {
    marginTop: 8,
  },
  achievementProgressText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginBottom: 4,
  },
  achievementProgressBar: {
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  achievementBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
});