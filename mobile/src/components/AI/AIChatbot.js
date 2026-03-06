import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { chatWithAssistant } from '../../services/api';
import { COLORS, SPACING, BORDER_RADIUS } from '../../utils/constants';

export default function AIChatbot({ tripContext, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm AtlasAI 🌍 Your personal travel assistant. Ask me anything about destinations, itineraries, visas, packing tips, or let me help optimize your trip!",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));
      const response = await chatWithAssistant(text, history, tripContext);
      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't connect right now. Try again in a moment! 🙏",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const QUICK_PROMPTS = [
    "Best time to visit Bali?",
    "Pack list for Europe in winter",
    "Visa requirements for Japan",
    "Budget tips for Southeast Asia",
  ];

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>🤖</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
          <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <LinearGradient colors={[COLORS.navyDark, COLORS.navy]} style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiDot} />
          <View>
            <Text style={styles.headerTitle}>AtlasAI Assistant</Text>
            <Text style={styles.headerSubtitle}>AI-powered travel expert</Text>
          </View>
        </View>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textPrimary} />
          </TouchableOpacity>
        )}
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={
          loading ? (
            <View style={styles.typingIndicator}>
              <ActivityIndicator size="small" color={COLORS.gold} />
              <Text style={styles.typingText}>AtlasAI is thinking...</Text>
            </View>
          ) : null
        }
      />

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <View style={styles.quickPromptsRow}>
          {QUICK_PROMPTS.map((prompt) => (
            <TouchableOpacity
              key={prompt}
              style={styles.quickPrompt}
              onPress={() => { setInput(prompt); }}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Input */}
      {Platform.OS === 'ios' ? (
        <BlurView intensity={40} tint="dark" style={styles.inputContainer}>
          <InputRow input={input} setInput={setInput} onSend={sendMessage} loading={loading} />
        </BlurView>
      ) : (
        <View style={[styles.inputContainer, { backgroundColor: COLORS.navyLight }]}>
          <InputRow input={input} setInput={setInput} onSend={sendMessage} loading={loading} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function InputRow({ input, setInput, onSend, loading }) {
  return (
    <View style={styles.inputRow}>
      <TextInput
        style={styles.textInput}
        value={input}
        onChangeText={setInput}
        placeholder="Ask AtlasAI anything..."
        placeholderTextColor={COLORS.textMuted}
        multiline
        maxLength={500}
        returnKeyType="send"
        onSubmitEditing={onSend}
      />
      <TouchableOpacity
        style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
        onPress={onSend}
        disabled={!input.trim() || loading}
      >
        <LinearGradient
          colors={[COLORS.gold, COLORS.goldDark]}
          style={styles.sendBtnGradient}
        >
          <Ionicons name="send" size={18} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.navyDark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glassBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  aiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    marginRight: SPACING.sm,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  messagesList: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.navyLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  aiAvatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '78%',
    padding: SPACING.sm + 4,
    borderRadius: BORDER_RADIUS.lg,
  },
  aiBubble: {
    backgroundColor: COLORS.navyLight,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.gold,
    borderTopRightRadius: 4,
  },
  bubbleText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  userBubbleText: {
    color: '#fff',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  typingText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  quickPromptsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  quickPrompt: {
    backgroundColor: COLORS.navyLight,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  quickPromptText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.glassBorder,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.sm,
    gap: SPACING.sm,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.navyLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 14,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
  sendBtn: {
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendBtnGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
});
