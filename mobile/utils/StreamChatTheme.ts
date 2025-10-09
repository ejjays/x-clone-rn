import type { DeepPartial, Theme } from "stream-chat-expo";
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
      bg_gradient_end: base.chatBackground ?? base.background,
      bg_gradient_start: base.chatBackground ?? base.background,
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
      white_snow: base.chatBackground ?? base.background,
    },
    messageInput: {
      container: {
        backgroundColor: base.card,
        borderTopWidth: 1,
        borderTopColor: base.border,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 12 : 20,
        minHeight: Platform.OS === 'ios' ? 60 : 72,
      },
      inputBox: {
        backgroundColor: base.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: base.border,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS === 'ios' ? 10 : 12,
        fontSize: 16,
        maxHeight: 120,
        minHeight: Platform.OS === 'ios' ? 36 : 40,
        color: base.text,
        textAlignVertical: 'center',
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
        marginBottom: 2,
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
        marginBottom: 2,
      },
      inputBoxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: 0,
      },
    },
    messageList: {
      container: {
        backgroundColor: base.chatBackground ?? base.background,
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
