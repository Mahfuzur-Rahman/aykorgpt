import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

interface Source {
  source: string;
  section: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const QUICK_PROMPTS = [
  "What is the tax-free threshold in Bangladesh?",
  "How is house rent allowance taxed?",
  "What is the VAT rate on IT services?",
];

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(queryText?: string) {
    const text = (queryText || input).trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          user_id: "mobile-app-user",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: data.answer,
          sources: data.sources || [],
        },
      ]);
    } catch (err: any) {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: err?.message || "Failed to reach AykorGPT server. Please verify network connection.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          data={messages}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>Ask AykorGPT Anything</Text>
              <Text style={styles.emptySubtitle}>
                Get instant answers backed by official Bangladesh NBR Tax Acts & SROs.
              </Text>
              <View style={styles.promptsContainer}>
                {QUICK_PROMPTS.map((prompt) => (
                  <TouchableOpacity
                    key={prompt}
                    style={styles.promptBtn}
                    onPress={() => send(prompt)}
                  >
                    <Text style={styles.promptText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === "user" ? styles.userBubble : styles.botBubble,
              ]}
            >
              <Text
                style={
                  item.role === "user" ? styles.userText : styles.botText
                }
              >
                {item.content}
              </Text>

              {item.sources && item.sources.length > 0 && (
                <View style={styles.sourcesContainer}>
                  <Text style={styles.sourcesHeader}>Official Citations:</Text>
                  {item.sources.map((s, idx) => (
                    <Text key={idx} style={styles.sourceItem}>
                      • {s.source} {s.section ? `(${s.section})` : ""}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          )}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#0F6E56" />
            <Text style={styles.loadingText}>AykorGPT is researching NBR documents…</Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about taxes, VAT, TDS, rebates..."
            placeholderTextColor="#9ca3af"
            onSubmitEditing={() => send()}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => send()}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  list: {
    padding: 16,
    gap: 12,
    flexGrow: 1,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  promptsContainer: {
    width: "100%",
    gap: 10,
  },
  promptBtn: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 110, 86, 0.2)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  promptText: {
    color: "#0F6E56",
    fontSize: 13,
    fontWeight: "500",
  },
  bubble: {
    maxWidth: "85%",
    padding: 14,
    borderRadius: 18,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#0F6E56",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userText: {
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: "#1e293b",
    fontSize: 14,
    lineHeight: 21,
  },
  sourcesContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  sourcesHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0F6E56",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  sourceItem: {
    fontSize: 11,
    color: "#64748b",
    lineHeight: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 12,
    color: "#64748b",
  },
  inputRow: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  sendBtn: {
    backgroundColor: "#0F6E56",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
    justifyContent: "center",
  },
  sendBtnDisabled: {
    backgroundColor: "#94a3b8",
  },
  sendText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
});

