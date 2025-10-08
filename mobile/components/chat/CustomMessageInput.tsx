import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useMessageInputContext } from 'stream-chat-expo';
import { Ionicons, Feather, FontAwesome } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { DarkThemeColors } from '@/constants/Colors';

const CustomMessageInput = () => {
  const { sendMessage } = useMessageInputContext();
  const { colors } = useTheme();

  const [inputValue, setInputValue] = React.useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage({ text: inputValue });
      setInputValue('');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cameraButton}>
        <Ionicons name="camera" size={24} color="white" />
      </TouchableOpacity>
      <TextInput
        style={[styles.textInput, { color: colors.text }]}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder="Message..."
        placeholderTextColor={colors.textSecondary}
      />
      {inputValue ? (
        <TouchableOpacity style={styles.iconButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color={colors.blue} />
        </TouchableOpacity>
      ) : (
        <>
          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="microphone" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="smile" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleSend}>
            <Ionicons name="add-circle" size={24} color={colors.blue} />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    margin: 8,
    backgroundColor: DarkThemeColors.background, // Using dark theme color
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  cameraButton: {
    backgroundColor: '#A020F0', // as in the image
    padding: 8,
    borderRadius: 25,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Platform.OS === 'android' ? 8 : 12,
  },
  iconButton: {
    padding: 8,
  },
});

export default CustomMessageInput;
