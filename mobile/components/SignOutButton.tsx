// mobile/components/SignOutButton.tsx
import { useSignOut } from '@/hooks/useSignOut';
import { LogOut } from 'lucide-react-native';
import { TouchableOpacity, Text } from 'react-native';

const SignOutButton = () => {
  const { openSignOutDialog, SignOutDialog } = useSignOut();

  return (
    <>
      <TouchableOpacity onPress={openSignOutDialog} className="flex-row items-center p-4">
        <LogOut color="red" size={20} />
        <Text className="text-red-500 text-base ml-4">Sign Out</Text>
      </TouchableOpacity>
      <SignOutDialog />
    </>
  );
};

export default SignOutButton;