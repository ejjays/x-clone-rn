import { useClerk } from "@clerk/clerk-expo";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";

export const useSignOut = () => {
  const { signOut } = useClerk();

  const handleSignOut = () => {
 Dialog.show({
 type: ALERT_TYPE.WARNING,
 title: 'Logout',
 textBody: 'Are you sure you want to logout?',
 button: [
        {
 text: 'Cancel',
 onPress: () => Dialog.hide(),
        },
        {
      type: ALERT_TYPE.WARNING,
      title: "Logout",
      textBody: "Are you sure you want to logout?",
      button: [
        {
          text: "Cancel",
          onPress: () => Dialog.hide(),
        },
        {
 text: 'Logout',

        onPress: () => signOut(),
      },
    ]);
  };

  return { handleSignOut };
};
