import * as ImagePicker from 'expo-image-picker';
import { Platform, Alert } from 'react-native';

interface Media {
  uri: string;
  type: 'image' | 'video';
  name: string;
  mimeType: string;
}

export const pickMedia = async (): Promise<Media | null> => {
  try {
    // Request permissions
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Please grant media library permissions to upload images and videos.'
        );
        return null;
      }
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      
      // Validate file size (Stream has a 100MB default limit)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (asset.fileSize && asset.fileSize > maxSize) {
        Alert.alert(
          'File Too Large', 
          'Please select a file smaller than 100MB.'
        );
        return null;
      }

      // Get file extension and name
      const uriParts = asset.uri.split('/');
      const fileName = uriParts[uriParts.length - 1] || `media_${Date.now()}`;
      
      return { 
        uri: asset.uri, 
        type: asset.type as 'image' | 'video',
        name: fileName,
        mimeType: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg')
      };
    }

    return null;
  } catch (error) {
    console.error('❌ Error picking media:', error);
    Alert.alert('Error', 'Failed to pick media. Please try again.');
    return null;
  }
};