import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "@/context/ThemeContext";

export interface ConfirmationAlertProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonColor?: "danger" | "primary" | "warning";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationAlert: React.FC<ConfirmationAlertProps> = ({
  visible,
  title,
  message,
  confirmText = "Okay",
  cancelText = "Cancel",
  confirmButtonColor = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const { colors } = useTheme();

  const getConfirmButtonStyle = () => {
    switch (confirmButtonColor) {
      case "danger":
        return styles.dangerButton;
      case "primary":
        return styles.primaryButton;
      case "warning":
        return styles.warningButton;
      default:
        return styles.primaryButton;
    }
  };

  const confirmButtonStyle = getConfirmButtonStyle();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={[styles.container, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {message}
          </Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, {backgroundColor: colors.border}]} // Darker background for cancel button
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, { color: colors.text }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, confirmButtonStyle]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.buttonText}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // Darker backdrop
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  container: {
    borderRadius: 10,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: "100%",
    maxWidth: 340,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 19,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
    color: "#fff", // Light text color
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
    color: "#ddd", // Lighter text color
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
  },
  primaryButton: {
    backgroundColor: "#3b82f6", // Facebook blue
  },
  dangerButton: {
    backgroundColor: "#ef4444",
  },
  warningButton: {
    backgroundColor: "#f59e0b",
  },
  cancelButton: {
    
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#fff",
  },
});

export default ConfirmationAlert;
