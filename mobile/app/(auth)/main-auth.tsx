import React, { useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
  PixelRatio,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';
import { useSocialAuth } from '@/hooks/useSocialAuth';
import { useRouter } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';

const HERO_IMAGE = require('../../assets/images/hero.png');
const PCMI_ICON = require('../../assets/images/icon.png');
const GOOGLE_LOGO = require('../../assets/images/google.png');
const FACEBOOK_LOGO = require('../../assets/images/facebook.png');

const getHorizontalResponsiveSize = (size, width) => {
  const scale = width / 375; // Base width
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

export default function AuthScreen() {
  const { width, height } = useWindowDimensions();
  const styles = getStyles(width, height);
  const { handleSocialAuth, isLoading } = useSocialAuth();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#000');
    }
  }, []);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#000' }} />;
  }

  const handleEmailSignup = () => {
    router.push('/(auth)/sign-up');
  };

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={{ width: '100%', aspectRatio: 1 }}>
          <Image
            source={HERO_IMAGE}
            resizeMode="contain"
            style={{ width: '100%', height: '100%' }}
          />
        </View>

        <View style={styles.content}>
          <View>
            <View style={styles.brandRow}>
              <View style={styles.logoFallback}>
                <Image source={PCMI_ICON} style={styles.logoImage} />
              </View>
              <Text allowFontScaling style={styles.brandText}>PCMI</Text>
            </View>

            <Text allowFontScaling style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit>Pag-ibig Christian Ministries - Infanta Quezon</Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleEmailSignup}
              style={styles.primaryButton}
            >
              <Text allowFontScaling style={styles.primaryButtonText}>Sign up with Email</Text>
            </TouchableOpacity>

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text allowFontScaling style={styles.orText}>or continue with</Text>
              <View style={styles.orLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSocialAuth("oauth_google")}
                style={[styles.socialButton, { marginRight: getHorizontalResponsiveSize(8, width) }]}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#4285F4" />
                ) : (
                  <Image source={GOOGLE_LOGO} style={styles.socialLogo} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleSocialAuth("oauth_facebook")}
                style={[styles.socialButton, { marginLeft: getHorizontalResponsiveSize(8, width) }]}
                disabled={isLoading}
              >
                <Image source={FACEBOOK_LOGO} style={styles.socialLogo} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.footer}>
            <Text allowFontScaling style={styles.disclaimer}>
              By continuing, you agree to PCMI's{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://bandlab.com/terms')}
              >
                Terms of Use
              </Text>{' '}
              and{' '}
              <Text
                style={styles.link}
                onPress={() => Linking.openURL('https://bandlab.com/privacy')}
              >
                Privacy Policy
              </Text>
            </Text>
            <View style={styles.loginRow}>
              <Text allowFontScaling style={styles.loginText}>Have an account? </Text>
              <Text
                style={[styles.loginText, styles.loginLink]}
                onPress={handleLogin}
              >
                Log in
              </Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (width, height) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    backgroundColor: '#000',
    alignItems: 'center',
    flex: 1, // Added flex: 1 to the container
    justifyContent: 'space-between', // Distribute content vertically
  },
  content: {
    backgroundColor: '#000',
    paddingHorizontal: getHorizontalResponsiveSize(24, width),
    paddingTop: getVerticalResponsiveSize(32, height), 
    width: '100%',
    maxWidth: 500,
    flex: 1, // Allow content to expand
    justifyContent: 'space-between', // Distribute content vertically within content
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getVerticalResponsiveSize(8, height),
  },
  logoFallback: {
    width: getHorizontalResponsiveSize(38, width),
    height: getHorizontalResponsiveSize(38, width),
    borderRadius: getHorizontalResponsiveSize(8, width),
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getHorizontalResponsiveSize(12, width),
  },
  logoImage: {
    width: getHorizontalResponsiveSize(38, width),
    height: getHorizontalResponsiveSize(38, width),
    resizeMode: 'contain',
    borderRadius: getHorizontalResponsiveSize(6, width),
  },
  brandText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: getHorizontalResponsiveSize(32, width),
    color: '#ffffff',
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: getHorizontalResponsiveSize(16, width),
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: getVerticalResponsiveSize(24, height),
  },
  primaryButton: {
    backgroundColor: '#333',
    borderRadius: getHorizontalResponsiveSize(24, width),
    height: getVerticalResponsiveSize(48, height),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getVerticalResponsiveSize(20, height),
  },
  primaryButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: getHorizontalResponsiveSize(16, width),
    color: '#ffffff',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getVerticalResponsiveSize(20, height),
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#555',
  },
  orText: {
    marginHorizontal: getHorizontalResponsiveSize(12, width),
    fontFamily: 'Poppins_400Regular',
    fontSize: getHorizontalResponsiveSize(12, width),
    color: '#BDBDBD',
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialButton: {
    flex: 1,
    minWidth: 0,
    height: getVerticalResponsiveSize(48, height),
    borderRadius: getHorizontalResponsiveSize(24, width),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  socialLogo: {
    width: getHorizontalResponsiveSize(24, width),
    height: getHorizontalResponsiveSize(24, width),
  },
  disclaimer: {
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
    fontSize: getHorizontalResponsiveSize(12, width),
    color: '#828282',
    lineHeight: getVerticalResponsiveSize(18, height),
    marginBottom: getVerticalResponsiveSize(8, height),
  },
  link: {
    color: '#ffffff',
    fontFamily: 'Poppins_600SemiBold',
  },
  footer: {
    backgroundColor: '#000',
    paddingBottom: 0,
    width: '100%',
    maxWidth: 500,
    // Removed marginTop, it was pushing the footer down, causing overflow
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getVerticalResponsiveSize(12, height),
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  loginText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: getHorizontalResponsiveSize(14, width),
    color: '#BDBDBD',
  },
  loginLink: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#ffffff',
  },
});
