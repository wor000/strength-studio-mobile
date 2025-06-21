import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Search, 
  Filter, 
  Plus,
  Clock,
  Target,
  Dumbbell,
  ChevronRight
} from 'lucide-react-native';
import { useGym } from '@/src/contexts/GymContext';

export default function WorkoutsScreen() {
  const { routines, exercises } = useGym();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Strength', 'Cardio', 'Flexibility'];

  const filteredRoutines = routines.filter(routine => {
    const matchesSearch = routine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         routine.objective.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
                         routine.exercises.some(ex => {
                           const exercise = exercises.find(e => e.id === ex.exerciseId);
                           return exercise?.type === selectedFilter.toLowerCase();
                         });
    return matchesSearch && matchesFilter;
  });

  const getRoutineImage = (routine: any) => {
    // Return different images based on routine type
    const images = [
      'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=400',
    ];
    return images[Math.abs(routine.name.length) % images.length];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workouts</Text>
        <TouchableOpacity style={styles.addButton}>
          <Plus size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search workouts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter size={20} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              selectedFilter === filter && styles.filterTabActive
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextActive
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workouts List */}
      <ScrollView style={styles.workoutsList} showsVerticalScrollIndicator={false}>
        {filteredRoutines.length > 0 ? (
          filteredRoutines.map((routine) => (
            <TouchableOpacity key={routine.id} style={styles.workoutCard}>
              <Image
                source={{ uri: getRoutineImage(routine) }}
                style={styles.workoutImage}
              />
              <View style={styles.workoutContent}>
                <View style={styles.workoutHeader}>
                  <Text style={styles.workoutTitle}>{routine.name}</Text>
                  <ChevronRight size={20} color="#6b7280" />
                </View>
                <Text style={styles.workoutObjective}>{routine.objective}</Text>
                
                <View style={styles.workoutStats}>
                  <View style={styles.statItem}>
                    <Dumbbell size={16} color="#6366f1" />
                    <Text style={styles.statText}>{routine.exercises.length} exercises</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Clock size={16} color="#6366f1" />
                    <Text style={styles.statText}>{routine.estimatedDuration}min</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Target size={16} color="#6366f1" />
                    <Text style={styles.statText}>{routine.days.join(', ')}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Dumbbell size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No workouts found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery ? 'Try adjusting your search' : 'Create your first workout to get started'}
            </Text>
            <TouchableOpacity style={styles.createButton}>
              <Text style={styles.createButtonText}>Create Workout</Text>
            </TouchableOpacity>
          </View>
        )}
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1f2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 20,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTabActive: {
    backgroundColor: '#6366f1',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  workoutsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  workoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutImage: {
    width: '100%',
    height: 120,
  },
  workoutContent: {
    padding: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    marginBottom: 12,
  },
  workoutStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6b7280',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#ffffff',
  },
});