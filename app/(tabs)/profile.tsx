import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Edit3,
  Award,
  Target,
  Calendar
} from 'lucide-react-native';
import { useAuth } from '@/src/hooks/useAuth';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const profileStats = [
    { label: 'Workouts', value: '23', icon: Target },
    { label: 'Streak', value: '7 days', icon: Calendar },
    { label: 'Achievements', value: '5', icon: Award },
  ];

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Edit Profile', onPress: () => {} },
        { icon: Target, label: 'Goals & Preferences', onPress: () => {} },
        { icon: Award, label: 'Achievements', onPress: () => {} },
      ],
    },
    {
      title: 'Settings',
      items: [
        { 
          icon: Bell, 
          label: 'Notifications', 
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
              thumbColor={notificationsEnabled ? '#ffffff' : '#f3f4f6'}
            />
          )
        },
        { 
          icon: Settings, 
          label: 'Dark Mode', 
          rightComponent: (
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#e5e7eb', true: '#6366f1' }}
              thumbColor={darkModeEnabled ? '#ffffff' : '#f3f4f6'}
            />
          )
        },
        { icon: Shield, label: 'Privacy & Security', onPress: () => {} },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help & Support', onPress: () => {} },
        { icon: LogOut, label: 'Sign Out', onPress: signOut, danger: true },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.editButton}>
            <Edit3 size={20} color="#6366f1" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200' }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.avatarEditButton}>
              <Edit3 size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>
            {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          <Text style={styles.userBio}>
            Fitness enthusiast on a journey to build strength and confidence. 
            Every workout is a step closer to my goals! 💪
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {profileStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={styles.statIcon}>
                <stat.icon size={20} color="#6366f1" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuContainer}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex === section.items.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[
                      styles.menuIcon,
                      item.danger && styles.menuIconDanger,
                    ]}>
                      <item.icon 
                        size={20} 
                        color={item.danger ? '#ef4444' : '#6b7280'} 
                      />
                    </View>
                    <Text style={[
                      styles.menuLabel,
                      item.danger && styles.menuLabelDanger,
                    ]}>
                      {item.label}
                    </Text>
                  </View>
                  
                  {item.rightComponent || (
                    <ChevronRight 
                      size={20} 
                      color={item.danger ? '#ef4444' : '#9ca3af'} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Strength Studio v1.0.0</Text>
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
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginBottom: 12,
  },
  userBio: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 4,
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconDanger: {
    backgroundColor: '#fee2e2',
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#1f2937',
  },
  menuLabelDanger: {
    color: '#ef4444',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9ca3af',
  },
});