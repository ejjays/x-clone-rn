import { useSignOut } from "@/hooks/useSignOut"
import { LogOut } from "lucide-react-native" // Replaced Feather
import { TouchableOpacity } from "react-native"
const SignOutButton = () => {
  const { handleSignOut } = useSignOut()
  return (
    <TouchableOpacity onPress={handleSignOut}>
      <LogOut size={24} color={"#E0245E"} />
    </TouchableOpacity>
  )
}
export default SignOutButton