import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NBR Tax Intelligence</Text>
        </View>

        <Text style={styles.title}>
          Aykor<Text style={styles.titleAccent}>GPT</Text>
        </Text>
        
        <Text style={styles.subtitle}>
          Your instant AI-powered Bangladesh Income Tax, VAT, Customs & TDS expert.
        </Text>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={() => router.push("/chat")}
        >
          <Text style={styles.buttonText}>Start Asking Questions</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Citing official Income Tax Acts, SROs & Paripatras
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  badge: {
    backgroundColor: "rgba(15, 110, 86, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: "#0F6E56",
    fontSize: 13,
    fontWeight: "600",
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  titleAccent: {
    color: "#0F6E56",
  },
  subtitle: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 36,
    textAlign: "center",
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#0F6E56",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    shadowColor: "#0F6E56",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 20,
    textAlign: "center",
  },
});

