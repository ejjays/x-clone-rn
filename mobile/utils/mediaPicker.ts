import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { Platform } from 'react-native';

interface Media {
  uri: string;
  type: 'image' | 'video';
}

export const pickMedia = async (): Promise<Media | null> => {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need media library permissions to make this work!');
      return null;
    }
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 1,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    const type = result.assets[0].type;
    return { uri, type };
  }

  return null;
};

export const uploadMediaToCloudinary = async (media: Media): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', {
    uri: media.uri,
    type: `${media.type}/${media.uri.split('.').pop()}`,
    name: `${media.type}.${media.uri.split('.').pop()}`,
  } as any); // Type assertion might be needed depending on the exact FormData type definition
  formData.append('upload_preset', 'your_upload_preset'); // Replace with your Cloudinary upload preset

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/your_cloud_name/${media.type}/upload`, // Replace with your Cloudinary cloud name
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.secure_url;
  } catch (error) {
    console.error('Error uploading media to Cloudinary:', error);
    return null;
  }
};