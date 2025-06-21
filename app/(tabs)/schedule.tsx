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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  CheckCircle
} from 'lucide-react-native';
import { useGym } from '@/src/contexts/GymContext';

const { width } = Dimensions.get('window');
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ScheduleScreen() {
  const { routines, workoutSessions } = useGym();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  };

  const hasWorkout = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayMap: { [key: string]: string } = {
      'monday': 'segunda',
      'tuesday': 'terca',
      'wednesday': 'quarta',
      'thursday': 'quinta',
      'friday': 'sexta',
      'saturday': 'sabado',
      'sunday': 'domingo'
    };
    
    return routines.some(routine => 
      routine.days.includes(dayMap[dayName])
    );
  };

  const isWorkoutCompleted = (date: Date) => {
    return workoutSessions.some(session => 
      new Date(session.date).toDateString() === date.toDateString() && 
      session.end_time
    );
  };

  const getScheduledWorkouts = (date: Date) => {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const dayMap: { [key: string]: string } = {
      'monday': 'segunda',
      'tuesday': 'terca',
      'wednesday': 'quarta',
      'thursday': 'quinta',
      'friday': 'sexta',
      'saturday': 'sabado',
      'sunday': 'domingo'
    };
    
    return routines.filter(routine => 
      routine.days.includes(dayMap[dayName])
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);
  const scheduledWorkouts = getScheduledWorkouts(selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Schedule</Text>
          <CalendarIcon size={28} color="#6366f1" />
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Month Navigation */}
          <View style={styles.monthHeader}>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('prev')}
            >
              <ChevronLeft size={24} color="#6366f1" />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
            <TouchableOpacity 
              style={styles.navButton}
              onPress={() => navigateMonth('next')}
            >
              <ChevronRight size={24} color="#6366f1" />
            </TouchableOpacity>
          </View>

          {/* Days of Week */}
          <View style={styles.daysHeader}>
            {DAYS.map(day => (
              <Text key={day} style={styles.dayHeaderText}>{day}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  day && isToday(day) && styles.todayCell,
                  day && isSameDay(day, selectedDate) && styles.selectedCell,
                ]}
                onPress={() => day && setSelectedDate(day)}
                disabled={!day}
              >
                {day && (
                  <>
                    <Text style={[
                      styles.dayText,
                      isToday(day) && styles.todayText,
                      isSameDay(day, selectedDate) && styles.selectedText,
                    ]}>
                      {day.getDate()}
                    </Text>
                    {hasWorkout(day) && (
                      <View style={[
                        styles.workoutIndicator,
                        isWorkoutCompleted(day) && styles.completedIndicator
                      ]} />
                    )}
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Selected Date Workouts */}
        <View style={styles.workoutsContainer}>
          <Text style={styles.sectionTitle}>
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>

          {scheduledWorkouts.length > 0 ? (
            scheduledWorkouts.map((routine) => {
              const isCompleted = isWorkoutCompleted(selectedDate);
              return (
                <View key={routine.id} style={styles.workoutCard}>
                  <View style={styles.workoutHeader}>
                    <View style={styles.workoutInfo}>
                      <Text style={styles.workoutTitle}>{routine.name}</Text>
                      <Text style={styles.workoutObjective}>{routine.objective}</Text>
                    </View>
                    {isCompleted ? (
                      <View style={styles.completedBadge}>
                        <CheckCircle size={20} color="#10b981" />
                        <Text style={styles.completedText}>Completed</Text>
                      </View>
                    ) : (
                      <TouchableOpacity style={styles.startButton}>
                        <Play size={16} color="#ffffff" />
                        <Text style={styles.startButtonText}>Start</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={styles.workoutDetails}>
                    <View style={styles.detailItem}>
                      <Clock size={16} color="#6b7280" />
                      <Text style={styles.detailText}>{routine.estimatedDuration} min</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Text style={styles.exerciseCount}>{routine.exercises.length} exercises</Text>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.noWorkoutsContainer}>
              <Text style={styles.noWorkoutsText}>No workouts scheduled</Text>
              <Text style={styles.noWorkoutsSubtext}>
                Enjoy your rest day or add a new workout
              </Text>
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
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
    paddingVertical: 8,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 72) / 7,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayCell: {
    backgroundColor: '#ede9fe',
    borderRadius: 8,
  },
  selectedCell: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1f2937',
  },
  todayText: {
    color: '#6366f1',
    fontFamily: 'Inter-Bold',
  },
  selectedText: {
    color: '#ffffff',
    fontFamily: 'Inter-Bold',
  },
  workoutIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6366f1',
  },
  completedIndicator: {
    backgroundColor: '#10b981',
  },
  workoutsContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  workoutCard: {
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
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  workoutObjective: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 4,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  completedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#10b981',
    marginLeft: 4,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
    marginLeft: 4,
  },
  workoutDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginLeft: 4,
  },
  exerciseCount: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
  },
  noWorkoutsContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noWorkoutsText: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  noWorkoutsSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});