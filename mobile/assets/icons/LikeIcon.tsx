import { reactionComponents } from "@/utils/reactions";
import { Path, Svg } from "react-native-svg";

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
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M16.486 6.551C15.9965 5.56832 15.2471 4.7461 14.3214 4.19565C13.3957 3.64521 12.3308 3.39258 11.25 3.39258C10.1692 3.39258 9.10434 3.64521 8.17863 4.19565C7.25291 4.7461 6.50352 5.56832 6.014 6.551M12 21.3934L12.022 21.3714C12.022 21.3714 12 21.3934 12 21.3934ZM12 21.3934C12 21.3934 12 21.3934 12 21.3934Z"
        stroke="#657786"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.00889 10.3926H7.5C6.83696 10.3926 6.20107 10.6552 5.73223 11.124C5.26339 11.5929 5 12.2288 5 12.8926V18.8926C5 19.5556 5.26339 20.1915 5.73223 20.6604C6.20107 21.1292 6.83696 21.3926 7.5 21.3926H8.00889M8.00889 10.3926V21.3926M8.00889 10.3926C9.11339 10.3926 10.158 10.021 11.002 9.35105L12 8.64258L12.998 9.35105C13.842 10.021 14.8866 10.3926 16.0022 10.3926C16.9453 10.3926 17.8631 10.1333 18.6393 9.64592C19.4155 9.15857 20 8.46993 20 7.64258C20 6.65487 19.467 5.76884 18.5912 5.275C17.7154 4.78116 16.6349 4.74015 15.7022 5.1634L12 6.89258"
        stroke="#657786"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};
export default LikeIcon;