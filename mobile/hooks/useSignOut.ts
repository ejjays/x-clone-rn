// mobile/hooks/useSignOut.ts
import { useState } from 'react';
import { useClerk } from '@clerk/clerk-expo';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
  ButtonGroup,
  ButtonText,
  Heading,
  Text,
} from '@gluestack-ui/themed';

export const useSignOut = () => {
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = () => setIsOpen(true);
  const closeDialog = () => setIsOpen(false);

  const handleSignOut = () => {
    closeDialog();
    signOut();
  };

  const SignOutDialog = () => (
    <AlertDialog isOpen={isOpen} onClose={closeDialog} size="md">
      <AlertDialogBackdrop />
      <AlertDialogContent>
        <AlertDialogHeader>
          <Heading size="lg">Logout</Heading>
        </AlertDialogHeader>
        <AlertDialogBody>
          <Text size="sm">Are you sure you want to logout?</Text>
        </AlertDialogBody>
        <AlertDialogFooter>
          <ButtonGroup space="lg">
            <Button variant="outline" action="secondary" onPress={closeDialog}>
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button bg="$error600" action="negative" onPress={handleSignOut}>
              <ButtonText>Logout</ButtonText>
            </Button>
          </ButtonGroup>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { openSignOutDialog: openDialog, SignOutDialog };
};