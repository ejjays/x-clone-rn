// mobile/hooks/useSignOut.ts
import { useState } from 'react';
import { useClerk } from '@clerk/clerk-expo';
import {
  Button, 
  ButtonText, 
  Heading,
} from '@gluestack-ui/themed';
import { Text } from 'react-native'; // Import Text from react-native instead

export const useSignOut = () => {
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);
  const openDialog = () =>
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        { text: 'Logout', onPress: () => signOut(), style: 'destructive' },
      ],
      { cancelable: true }
    );

  const handleSignOut = () => {
    signOut();
  };
  return { openSignOutDialog: openDialog };
};