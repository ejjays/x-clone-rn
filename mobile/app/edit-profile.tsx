import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import PressableScale from "@/constants/PressableScale"; // Import PressableScale

export default function EditProfile() {
  const { colors } = useTheme();
  const router = useRouter();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [username, setUsername] = useState("yANCHUI");
  const [email, setEmail] = useState("yanchui@gmail.com");
  const [phone, setPhone] = useState("+14987889999");
  const [password, setPassword] = useState("evFTbyVVCd");

  async function pickImage() {
    const permission =
      Platform.OS === "ios"
        ? await ImagePicker.requestMediaLibraryPermissionsAsync()
        : { granted: true };
    if (permission.granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    }
  }

  function handleUpdate() {
    console.log({ username, email, phone, password, avatar });
    // Add your update logic here
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: false, // Hide default header to use custom one
          animation: "fade",
        }}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        automaticallyAdjustKeyboardInsets
      >
        {/* Custom Header */}
        <View style={[styles.headerBackground, { backgroundColor: "#ff897a" }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerIcon}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={() => console.log("Share Profile")}
              style={styles.headerIcon}
            >
              <Ionicons name="share-social" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <View
            style={[styles.avatarContainer, { borderColor: colors.background }]}
          >
            <PressableScale onPress={pickImage}>
              {" "}
              {/* Changed to PressableScale */}
              <Image
                source={
                  avatar
                    ? { uri: avatar }
                    : require("../assets/images/default-avatar.png")
                }
                style={[
                  styles.avatar,
                  { borderColor: colors.background, borderWidth: 4 },
                ]}
              />
            </PressableScale>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "500",
                marginTop: 10,
              }}
              onPress={pickImage}
            >
              Change Picture
            </Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, marginBottom: 4 }}>
              Username
            </Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, marginBottom: 4 }}>
              Email I’d
            </Text>
            <TextInput
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, marginBottom: 4 }}>
              Phone Number
            </Text>
            <TextInput
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: colors.text, marginBottom: 4 }}>
              Password
            </Text>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.surface,
                },
              ]}
            />
          </View>
        </View>

        <PressableScale
          onPress={handleUpdate}
          style={[styles.updateButton, { backgroundColor: "#ff897a" }]}
        >
          <Text style={styles.updateButtonText}>Update</Text>
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    height: 180,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 16,
    marginTop: Platform.OS === "android" ? 16 : 0,
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  avatarContainer: {
    position: "absolute",
    bottom: -60,
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  formContainer: {
    marginTop: 80,
    paddingHorizontal: 24,
    flex: 1,
  },
  input: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    height: 55,
  },
  updateButton: {
    borderRadius: 9999,
    paddingVertical: 16,
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600", // Changed back to semi-bold
  },
});
