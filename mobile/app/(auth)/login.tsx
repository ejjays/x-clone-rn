import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  KeyboardAvoidingView,
  useWindowDimensions,
  ActivityIndicator,
  PixelRatio,
  TextInput,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from "@expo-google-fonts/poppins";
import { useSocialAuth } from "@/hooks/useSocialAuth";
import { useRouter } from "expo-router";
import * as NavigationBar from "expo-navigation-bar";
import { useSignIn } from "@clerk/clerk-expo";
import CustomAlert from "@/components/CustomAlert";

const GOOGLE_LOGO = require("../../assets/images/google.png");
const FACEBOOK_LOGO = require("../../assets/images/facebook.png");
const APPLE_LOGO = require("../../assets/images/apple-logo.png");

const getHorizontalResponsiveSize = (size, width) => {
  const scale = width / 375;
  const newSize = size * scale;
  const lowerBound = size * 0.85;
  const upperBound = size * 1.25;
  const clampedSize = Math.max(lowerBound, Math.min(newSize, upperBound));
  return Math.round(PixelRatio.roundToNearestPixel(clampedSize));
};

const getVerticalResponsiveSize = (size, height) => {
  const scale = height / 812; // Base height
  const newSize = size * scale;
  const lowerBound = size * 0.85;
  const upperBound = size * 1.25;
  const clampedSize = Math.max(lowerBound, Math.min(newSize, upperBound));
  return Math.round(PixelRatio.roundToNearestPixel(clampedSize));
};

export default function EmailLoginScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = getStyles(width, height);
  const { handleSocialAuth, isLoading: isSocialAuthLoading } = useSocialAuth();
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ visible: false, message: "" });

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setBackgroundColorAsync("#000");
    }
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: "#000" }} />;
  }

  const handleLogin = async () => {
    if (!isLoaded) {
      return;
    }
    setIsLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: username,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
      router.replace("/");
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      let message = "Login failed";
      if (err.errors && err.errors.length > 0) {
        const errorCode = err.errors[0].code;
        if (['form_param_format_invalid', 'form_identifier_not_found', 'form_password_incorrect'].includes(errorCode)) {
          message = "Username or password incorrect";
        } else {
          message = err.errors[0].longMessage || err.errors[0].message;
        }
      }
      setAlertInfo({ visible: true, message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log("Forgot Password pressed");
  };

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <ExpoStatusBar style="light" />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={getHorizontalResponsiveSize(24, width)}
                color="#fff"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Log in</Text>
          </View>
          <View style={styles.content}>
            <View>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#828282"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
            <View>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter at least 6 characters"
                  placeholderTextColor="#828282"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={getHorizontalResponsiveSize(24, width)}
                    color="#828282"
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPassword}>Forgot Password</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={handleLogin} disabled={isLoading}>
              <LinearGradient
                colors={["#1e3a8a", "#831843"]}
                style={styles.primaryButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Log in</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or continue with</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSocialAuth("oauth_google")}
                style={styles.socialButton}
                disabled={isSocialAuthLoading}
              >
                {isSocialAuthLoading ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <Image source={GOOGLE_LOGO} style={styles.socialLogo} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSocialAuth("oauth_facebook")}
                style={styles.socialButton}
                disabled={isSocialAuthLoading}
              >
                <Image source={FACEBOOK_LOGO} style={styles.socialLogo} />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSocialAuth("oauth_apple")}
                style={styles.socialButton}
                disabled={isSocialAuthLoading}
              >
                <Image source={APPLE_LOGO} style={styles.socialLogo} />
              </TouchableOpacity>
            </View>
            <Text allowFontScaling style={styles.disclaimer}>
              By continuing, you agree to PCMI's{" "}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL("https://bandlab.com/terms")}
              >
                Terms of Use
              </Text>{" "}
              and{" "}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL("https://bandlab.com/privacy")}
              >
                Privacy Policy
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
      <CustomAlert
        visible={alertInfo.visible}
        message={alertInfo.message}
        onOk={() => setAlertInfo({ visible: false, message: "" })}
      />
    </View>
  );
}

const getStyles = (width, height) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: "#000",
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: "#000",
      paddingHorizontal: getHorizontalResponsiveSize(24, width),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: getVerticalResponsiveSize(12, height),
    },
    backButton: {
      marginRight: getHorizontalResponsiveSize(16, width),
    },
    headerTitle: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: getHorizontalResponsiveSize(20, width),
      color: "#ffffff",
    },
    content: {
      flex: 1,
      paddingTop: getVerticalResponsiveSize(36, height),
    },
    label: {
      fontFamily: "Poppins_400Regular",
      fontSize: getHorizontalResponsiveSize(14, width),
      color: "#BDBDBD",
      marginBottom: getVerticalResponsiveSize(8, height),
    },
    input: {
      backgroundColor: "#1c1c1e",
      borderRadius: getHorizontalResponsiveSize(12, width),
      paddingHorizontal: getHorizontalResponsiveSize(16, width),
      paddingVertical: getVerticalResponsiveSize(12, height),
      fontFamily: "Poppins_400Regular",
      fontSize: getHorizontalResponsiveSize(16, width),
      color: "#ffffff",
      marginBottom: getVerticalResponsiveSize(16, height),
    },
    passwordContainer: {
      position: "relative",
    },
    eyeIcon: {
      position: "absolute",
      right: getHorizontalResponsiveSize(16, width),
      top: getVerticalResponsiveSize(12, height),
    },
    forgotPassword: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: getHorizontalResponsiveSize(14, width),
      color: "#ffffff",
      textAlign: "right",
      marginBottom: getVerticalResponsiveSize(24, height),
    },
    primaryButton: {
      borderRadius: getHorizontalResponsiveSize(24, width),
      height: getVerticalResponsiveSize(48, height),
      alignItems: "center",
      justifyContent: "center",
      marginBottom: getVerticalResponsiveSize(20, height),
    },
    primaryButtonText: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: getHorizontalResponsiveSize(16, width),
      color: "#ffffff",
    },
    orRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: getVerticalResponsiveSize(20, height),
    },
    orLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: "#555",
    },
    orText: {
      marginHorizontal: getHorizontalResponsiveSize(12, width),
      fontFamily: "Poppins_400Regular",
      fontSize: getHorizontalResponsiveSize(12, width),
      color: "#BDBDBD",
    },
    socialRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: getVerticalResponsiveSize(24, height),
    },
    socialButton: {
      width: getHorizontalResponsiveSize(100, width),
      height: getVerticalResponsiveSize(48, height),
      borderRadius: getHorizontalResponsiveSize(24, width),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff",
    },
    socialLogo: {
      width: getHorizontalResponsiveSize(24, width),
      height: getHorizontalResponsiveSize(24, width),
    },
    disclaimer: {
      textAlign: "center",
      fontFamily: "Poppins_400Regular",
      fontSize: getHorizontalResponsiveSize(12, width),
      color: "#828282",
      lineHeight: getVerticalResponsiveSize(18, height),
    },
    link: {
      color: "#ffffff",
      fontFamily: "Poppins_600SemiBold",
    },
  });
