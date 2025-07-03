import { useSignOut } from "@/hooks/useSignOut"
import { Feather } from "@expo/vector-icons"
import { TouchableOpacity } from "react-native"
const SignOutButton = () => {
  const { handleSignOut } = useSignOut()
  return (
    <TouchableOpacity onPress={handleSignOut}>
      <Feather name="log-out" size={20} color={"white"} />
    </TouchableOpacity>
  )
}
export default SignOutButton
