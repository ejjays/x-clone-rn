import { reactionComponents } from "@/utils/reactions";
import { Path, Svg } from "react-native-svg";
import { FontAwesome } from "@expo/vector-icons";

const LikeIcon = ({
  userReaction,
  ...props
}: {
  userReaction?: string;
  [key: string]: any;
}) => {
  const ReactionComponent = userReaction
    ? reactionComponents[userReaction as keyof typeof reactionComponents]
    : null;

  if (ReactionComponent) {
    return <ReactionComponent width={props.size} height={props.size} />;
  }

  return (
    <FontAwesome name="thumbs-up" size={props.size || 24} color="#657786" />
  );
};
export default LikeIcon;