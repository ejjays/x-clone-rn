import React, { useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';

const CustomAttachmentPicker = ({ onSelect, closePicker }) => {
  useEffect(() => {
    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        onSelect(result.assets[0]);
      } else {
        closePicker();
      }
    };

    pickImage();
  }, []);

  return null;
};

export default CustomAttachmentPicker;