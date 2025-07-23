import * as React from "react";
import Svg, { LinearGradient, Stop, Circle, Path } from "react-native-svg";

const AngryEmoji: React.FC<SvgProps> = (props) => (
  <Svg
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1500 1500"
    width={2500}
    height={2500}
    {...props}
  >
    <LinearGradient
      id="SVGID_1_"
      gradientUnits="userSpaceOnUse"
      x1={750}
      y1={1501.519}
      x2={750}
      y2={4.759}
      gradientTransform="matrix(1 0 0 -1 0 1499.72)"
    >
      <Stop offset={0.098} stopColor="#f05766" />
      <Stop offset={0.25} stopColor="#f3766a" />
      <Stop offset={0.826} stopColor="#ffda6b" />
    </LinearGradient>
    <Circle cx={750} cy={750} r={750} fill="url(#SVGID_1_)" />
    <Circle className="st1" cx={416.7} cy={947} r={73.7} />
    <Circle className="st1" cx={1082.7} cy={947} r={73.7} />
    <Path
      d="M205.9 805.1s120.5 93.7 423.4 93.7m662.6-93.7s-120.5 93.7-423.4 93.7"
      fill="none"
      stroke="#262c38"
      strokeWidth={60}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeMiterlimit={10}
    />
    <Path
      className="st1"
      d="M987.6 1211.4c0 41.7-106.7 43.3-238.4 43.3s-238.4-1.7-238.4-43.3c0-36.8 109.9-54.6 241.5-54.6s235.3 17.7 235.3 54.6z"
    />
  </Svg>
);

export default AngryEmoji;
