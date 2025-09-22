import { reactionComponents } from "@/utils/reactions";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useTheme } from "@/context/ThemeContext";

const LikeIcon = ({
  userReaction,
  ...props
}: {
  userReaction?: string;
  [key: string]: any;
}) => {
  const { colors } = useTheme();

  const ReactionComponent = userReaction
    ? reactionComponents[userReaction as keyof typeof reactionComponents]
    : null;

  if (ReactionComponent) {
    return <ReactionComponent width={props.size} height={props.size} />;
  }

  return (
    <FontAwesome
      name="thumbs-o-up"
      size={props.size || 24}
      color="#b0b3b8"
    />
  );
};
export default LikeIcon;
