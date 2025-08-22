// mobile/components/chat/MessageInput.tsx
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface MessageInputProps {
  colors: any;
  insetsBottom: number;
  keyboardHeight: number;
  systemUIHeight: number;
  quotedMessage: any | null;
  onCancelQuote: () => void;
  selectedMedia: { uri: string; type: "image" | "video" } | null;
  onClearMedia: () => void;
  onPickMedia: () => Promise<void>;
  inputRef: any;
  newMessage: string;
  setNewMessage: (v: string) => void;
  sending: boolean;
  onSend: () => void;
}

export default function MessageInput({ colors, keyboardHeight, systemUIHeight, quotedMessage, onCancelQuote, selectedMedia, onClearMedia, onPickMedia, inputRef, newMessage, setNewMessage, sending, onSend }: MessageInputProps) {
  return (
    <View
      className="flex-row items-end border-t px-4"
      style={{
        paddingTop: 12,
        paddingBottom: keyboardHeight > 0 ? 12 : 12 + systemUIHeight,
        marginBottom: Platform.OS === "android" ? keyboardHeight : 0,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
      }}
    >
      {quotedMessage && (
        <View className="absolute left-4 right-4 -top-14 px-3 py-2 rounded-xl border flex-row items-center" style={{ backgroundColor: colors.cardBackground, borderColor: colors.border }}>
          <View className="flex-1 mr-2">
            <Text className="text-xs font-semibold" style={{ color: colors.grayText }} numberOfLines={1}>
              Replying to {quotedMessage.user?.name || "User"}
            </Text>
            <Text className="text-xs" style={{ color: colors.text }} numberOfLines={1}>
              {quotedMessage.attachments?.[0]
                ? quotedMessage.attachments?.[0].type === "image"
                  ? "Photo"
                  : quotedMessage.attachments?.[0].type === "video"
                  ? "Video"
                  : "Attachment"
                : quotedMessage.text || ""}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancelQuote} className="p-1">
            <Ionicons name="close" size={18} color={colors.grayText} />
          </TouchableOpacity>
        </View>
      )}

      {selectedMedia ? (
        <TouchableOpacity onPress={onClearMedia} className="p-3 rounded-full bg-red-500 mr-2 mb-2">
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onPickMedia} className="p-3 rounded-full mr-2 mb-2" style={{ backgroundColor: colors.gray200 }}>
          <Ionicons name="image-outline" size={24} color={colors.grayText} />
        </TouchableOpacity>
      )}

      <View className="flex-1 mr-3">
        <TextInput
          ref={inputRef}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.grayText}
          className="rounded-full px-4 py-3 text-base"
          style={{ borderColor: colors.inputBorder, color: colors.text, backgroundColor: colors.inputBackground, borderWidth: 1 }}
          multiline
          maxLength={500}
          editable={!sending}
          textAlignVertical="top"
          autoCapitalize="sentences"
        />
      </View>

      <TouchableOpacity onPress={onSend} disabled={(!newMessage.trim() && !selectedMedia) || sending} className={`p-3 rounded-full ${(!newMessage.trim() && !selectedMedia) || sending ? "bg-gray-300" : "bg-blue-500"}`} style={{ marginBottom: 2, backgroundColor: ((!newMessage.trim() && !selectedMedia) || sending) ? colors.gray200 : colors.blue500 }}>
        {sending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons name="send" size={20} color={(!newMessage.trim() && !selectedMedia) ? colors.grayText : "white"} />
        )}
      </TouchableOpacity>
    </View>
  );
}