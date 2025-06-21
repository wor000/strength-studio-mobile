import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Send,
  Bot,
  User,
  Sparkles,
  MessageCircle
} from 'lucide-react-native';
import { useAIWorkout } from '@/src/hooks/useAIWorkout';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AICoachScreen() {
  const [inputMessage, setInputMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, isLoading, sendMessage } = useAIWorkout();

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    
    await sendMessage(message);
  };

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const formatMessage = (content: string) => {
    // Simple formatting for workout plans
    return content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markdown
      .replace(/\n\n/g, '\n') // Reduce double line breaks
      .trim();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.botIcon}>
            <Bot size={24} color="#6366f1" />
          </View>
          <View>
            <Text style={styles.title}>AI Coach</Text>
            <Text style={styles.subtitle}>Your personal fitness assistant</Text>
          </View>
        </View>
        <View style={styles.statusIndicator}>
          <Sparkles size={16} color="#10b981" />
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.welcomeContainer}>
            <View style={styles.welcomeIcon}>
              <MessageCircle size={48} color="#6366f1" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome to AI Coach!</Text>
            <Text style={styles.welcomeText}>
              I'm here to help you create personalized workout plans, answer fitness questions, 
              and guide you on your fitness journey. What would you like to work on today?
            </Text>
            <View style={styles.suggestionsContainer}>
              <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => setInputMessage('Create a beginner workout plan')}
              >
                <Text style={styles.suggestionText}>Create a workout plan</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => setInputMessage('How do I build muscle?')}
              >
                <Text style={styles.suggestionText}>Muscle building tips</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.suggestionButton}
                onPress={() => setInputMessage('What should I eat before workout?')}
              >
                <Text style={styles.suggestionText}>Nutrition advice</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageContainer,
                message.role === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <View style={styles.messageHeader}>
                <View style={[
                  styles.messageIcon,
                  message.role === 'user' ? styles.userIcon : styles.assistantIcon,
                ]}>
                  {message.role === 'user' ? (
                    <User size={16} color="#ffffff" />
                  ) : (
                    <Bot size={16} color="#6366f1" />
                  )}
                </View>
                <Text style={styles.messageRole}>
                  {message.role === 'user' ? 'You' : 'AI Coach'}
                </Text>
              </View>
              <View style={[
                styles.messageBubble,
                message.role === 'user' ? styles.userBubble : styles.assistantBubble,
              ]}>
                <Text style={[
                  styles.messageText,
                  message.role === 'user' ? styles.userText : styles.assistantText,
                ]}>
                  {formatMessage(message.content)}
                </Text>
              </View>
            </View>
          ))
        )}
        
        {isLoading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={styles.messageHeader}>
              <View style={[styles.messageIcon, styles.assistantIcon]}>
                <Bot size={16} color="#6366f1" />
              </View>
              <Text style={styles.messageRole}>AI Coach</Text>
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { animationDelay: '0ms' }]} />
                <View style={[styles.typingDot, { animationDelay: '150ms' }]} />
                <View style={[styles.typingDot, { animationDelay: '300ms' }]} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputMessage}
            onChangeText={setInputMessage}
            placeholder="Ask me anything about fitness..."
            placeholderTextColor="#9ca3af"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
          >
            <Send size={20} color={(!inputMessage.trim() || isLoading) ? '#9ca3af' : '#ffffff'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  botIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    marginTop: 2,
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  welcomeIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#ede9fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  suggestionText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6366f1',
    textAlign: 'center',
  },
  messageContainer: {
    marginBottom: 24,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userIcon: {
    backgroundColor: '#6366f1',
  },
  assistantIcon: {
    backgroundColor: '#ede9fe',
  },
  messageRole: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#6b7280',
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 16,
  },
  userBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#1f2937',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6b7280',
    marginRight: 4,
    opacity: 0.4,
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1f2937',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#e5e7eb',
  },
});