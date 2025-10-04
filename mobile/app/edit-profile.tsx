import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfirmationAlert from '@/components/ConfirmationAlert';
import { useNotification } from '@/context/NotificationContext';
import { Stack, useRouter } from "expo-router";
import { useTheme } from "@/context/ThemeContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFonts, Poppins_600SemiBold, Poppins_400Regular } from '@expo-google-fonts/poppins';
import { useCurrentUser } from "@/hooks/useCurrentUser";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useQueryClient } from "@tanstack/react-query";
import { userApi, useApiClient } from "@/utils/api";

export default function EditProfile() {
  const { colors } = useTheme();
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const api = useApiClient();
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  const [fontsLoaded] = useFonts({
    Poppins_600SemiBold,
    Poppins_400Regular,
  });

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const [bio, setBio] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState({
    name: '',
    username: '',
    bio: ''
  });



  // For ConfirmationAlert (back button confirmation)
  const [confirmBackVisible, setConfirmBackVisible] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`;
      const username = currentUser.username || '';
      const bio = currentUser.bio || '';
      
      setName(fullName);
      setUsername(username);
      setBio(bio);
      
      // Store original data for comparison
      setOriginalData({
        name: fullName,
        username,
        bio
      });
    }
  }, [currentUser]);

  useEffect(() => {
    checkForChanges();
  }, [name, username, bio, originalData]);

  const checkForChanges = () => {
    const hasNameChange = name.trim() !== originalData.name.trim();
    const hasUsernameChange = username.trim() !== originalData.username.trim();
    const hasBioChange = bio.trim() !== originalData.bio.trim();
    
    setHasChanges(hasNameChange || hasUsernameChange || hasBioChange);
  };

  const confirmDiscardChanges = () => {
    setConfirmBackVisible(false);
    router.back();
  };

  const handleBackPress = () => {
    if (hasChanges) {
      setConfirmBackVisible(true);
    } else {
      router.back();
    }
  };



  if (!fontsLoaded) {
    return null; // Or a loading indicator
  }

  const profilePictureUri = currentUser?.profilePicture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      (currentUser?.firstName || "") +
        " " +
        (currentUser?.lastName || "")
    )}&background=1877F2&color=fff&size=40`;

  const saveProfile = () => {
    if (!hasChanges) {
      showNotification('You haven\'t made any changes to save.');
      return;
    }

    setIsLoading(true);
    
    // Parse name into first and last name
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Prepare update data
    const updateData = {
      username: username.trim(),
      bio: bio.trim(),
      firstName,
      lastName
    };

    // OPTIMISTIC UPDATE - Update UI immediately
    const optimisticUserData = {
      ...currentUser,
      username: updateData.username,
      bio: updateData.bio,
      firstName: updateData.firstName,
      lastName: updateData.lastName
    };

    // Store current data for potential rollback
    const rollbackData = { ...currentUser };

    // Update the cache optimistically
    queryClient.setQueryData(['authUser', currentUser?.clerkId], optimisticUserData);
    
    // Update original data to prevent "unsaved changes" state
    const newOriginalData = {
      name: name.trim(),
      username: username.trim(),
      bio: bio.trim()
    };
    setOriginalData(newOriginalData);
    setHasChanges(false);

    // Navigate immediately
    router.back();

    // Perform API call in the background
    userApi.updateProfile(api, updateData)
      .then(response => {
        // Success
        if (response.data) {
          // Update with actual server response
          queryClient.setQueryData(['authUser', currentUser?.clerkId], response.data);
        }
        // Show success notification on the previous screen
        showNotification('Profile updated successfully!', 'Great!');
      })
      .catch(error => {
        // Error
        console.error('Error updating profile:', error);
        
        // REVERT OPTIMISTIC UPDATE
        queryClient.setQueryData(['authUser', currentUser?.clerkId], rollbackData);
        
        let errorMessage = 'Failed to update profile. Please try again.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Show error notification on the previous screen
        showNotification(errorMessage, 'Try Again');
      });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen
        options={{
          headerShown: false, // Hide default header to use custom one
          animation: "fade",
        }}
      />
      {/* Custom Header */}
      <View style={[styles.headerBackground, { backgroundColor: colors.background }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.headerIcon}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Update Profile{hasChanges ? ' •' : ''}
          </Text>
          <TouchableOpacity
            onPress={saveProfile}
            style={[
              styles.checkIcon,
              { opacity: (!hasChanges || isLoading) ? 0.5 : 1 }
            ]}
            disabled={!hasChanges || isLoading}
          >
            <Ionicons 
              name={isLoading ? "hourglass" : "checkmark"} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent} keyboardShouldPersistTaps="handled">
        {/* Profile Picture and Edit Icon */}
        <View style={styles.profilePictureContainer}>
          <Image
            source={{ uri: profilePictureUri }}
            style={styles.profilePicture}
          />
          <TouchableOpacity style={[styles.editIconContainer, { backgroundColor: colors.surface }]}>
            <MaterialIcons name="edit" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} 
            onChangeText={(text) => {
              setName(text);
              // Check for changes after state update
              setTimeout(() => checkForChanges(), 0);
            }}
            value={name}
            placeholder={name}
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Username</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]} 
            onChangeText={(text) => {
              setUsername(text);
              setTimeout(() => checkForChanges(), 0);
            }}
            value={username}
            placeholder={username}
            placeholderTextColor={colors.textMuted}
          />
        </View>



        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, { color: colors.text }]}>Bio</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { backgroundColor: colors.surface, color: colors.text }]} 
            onChangeText={(text) => {
              setBio(text);
              setTimeout(() => checkForChanges(), 0);
            }}
            value={bio}
            placeholder={bio}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>



      {/* Confirmation Alert for Back Navigation */}
      <ConfirmationAlert
        visible={confirmBackVisible}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to go back?"
        confirmText="Discard"
        cancelText="Stay"
        onConfirm={confirmDiscardChanges}
        onCancel={() => setConfirmBackVisible(false)}
        confirmTextColor="#FF3B30" // Red color for destructive action
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBackground: {
    position: "relative",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", 
    width: "100%",
    paddingHorizontal: 16,
    marginTop: Platform.OS === "android" ? 8 : 0,
  },
  headerIcon: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: "Poppins_600SemiBold",
  },
  checkIcon: {
    padding: 8,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  profilePictureContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#cccccc",
  },
  editIconContainer: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 12,
        fontFamily: "Poppins_400Regular",  },
  multilineInput: {
    height: 120, // Increased height for multiline input
    paddingVertical: 10, // Add vertical padding for better multiline appearance
    textAlignVertical: "top", // Ensures text starts from the top
  },
});
