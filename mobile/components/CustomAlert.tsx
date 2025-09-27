import React, { useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, useWindowDimensions, Pressable, PixelRatio } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_600SemiBold,
} from '@expo-google-fonts/poppins';

interface CustomAlertProps {
  visible: boolean;
  message: string;
  onOk: () => void;
  okText?: string;
}

const getHorizontalResponsiveSize = (size, width) => {
  const scale = width / 375;
  const newSize = size * scale;
  const lowerBound = size * 0.85;
  const upperBound = size * 1.25;
  const clampedSize = Math.max(lowerBound, Math.min(newSize, upperBound));
  return Math.round(PixelRatio.roundToNearestPixel(clampedSize));
};

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, message, onOk, okText = 'OK' }) => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = getStyles(width, insets);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
  });

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onOk();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [visible, onOk]);

  if (!fontsLoaded || !visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onOk}
    >
      <Pressable style={styles.backdrop} onPress={onOk}>
        <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
          <Pressable>
            <View style={styles.alertBox}>
              <Text style={styles.message}>{message}</Text>
              <TouchableOpacity onPress={onOk}>
                <Text style={styles.okButton}>{okText}</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const getStyles = (width: number, insets: any) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'flex-end',
  },
  container: {
    paddingHorizontal: 16,
  },
  alertBox: {
    backgroundColor: 'white',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  message: {
    color: '#000',
    fontSize: getHorizontalResponsiveSize(14, width),
    fontFamily: 'Poppins_400Regular',
    flexShrink: 1,
  },
  okButton: {
    color: '#000',
    fontSize: getHorizontalResponsiveSize(14, width),
    fontFamily: 'Poppins_600SemiBold',
    paddingLeft: 20,
  },
});

export default CustomAlert;