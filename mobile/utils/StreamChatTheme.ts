import type { DeepPartial, Theme } from "stream-chat-react-native";
import { DarkThemeColors, LightThemeColors } from "@/constants/Colors";
import { Platform } from "react-native";

export const createStreamChatTheme = (
  isDarkMode: boolean,
): DeepPartial<Theme> => {
  const base = isDarkMode ? DarkThemeColors : LightThemeColors;

  return {
    colors: {
      primary: base.blue,
      secondary: base.blue,
      accent_blue: base.blue,
      accent_green: "#20BD5F",
      accent_red: "#FF3742",
      bg_gradient_end: base.background,
      bg_gradient_start: base.background,
      black: "#000000",
      blue_alice: base.blue,
      border: base.border,
      grey: base.textSecondary,
      grey_gainsboro: base.border,
      grey_whisper: base.border,
      icon: base.icon,
      modal: base.card,
      overlay: "rgba(0, 0, 0, 0.5)",
      shadow_icon: "#00000080",
      targetedMessageBackground: isDarkMode ? base.surface : "#FBF4DD",
      transparent: "transparent",
      white: base.card,
      white_smoke: base.surface,
      white_snow: base.background,
    },
    messageInput: {
      container: {
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        paddingHorizontal: 12,
        paddingTop: 6,
        paddingBottom: Platform.OS === 'ios' ? 14 : 16,
        minHeight: Platform.OS === 'ios' ? 56 : 60,
      },
      inputBox: {
        backgroundColor: base.surface,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: base.border,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 10,
        fontSize: 16,
        maxHeight: 120,
        minHeight: Platform.OS === 'ios' ? 40 : 44,
        color: base.text,
        textAlignVertical: 'center',
        // floating effect
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
      },
      sendButton: {
        backgroundColor: base.blue,
        borderRadius: 20,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
        alignSelf: 'flex-end',
        marginBottom: 4,
        shadowColor: '#000',
        shadowOpacity: 0.16,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
      },
      attachButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: base.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        alignSelf: 'flex-end',
        marginBottom: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
      },
      inputBoxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 0,
        marginHorizontal: 8,
        marginBottom: 8,
      },
    },
    messageList: {
      container: {
        backgroundColor: base.background,
        flex: 1,
      },
    },
    overlay: {
      container: {
        backgroundColor: base.background,
      },
    },
  };
};
