import * as React from "react";
import Svg, {
  Path,
  Circle,
  G,
  Defs,
  RadialGradient,
  Stop,
  Filter,
  FeGaussianBlur,
  LinearGradient,
} from "react-native-svg";
import { SvgProps } from "react-native-svg";

const LaughingEmoji: React.FC<SvgProps> = (props) => (
  <Svg viewBox="0 0 192 192" {...props}>
    <RadialGradient
      id="a"
      cy="0%"
      gradientTransform="matrix(0 1 -1.26314 0 .5 -.5)"
      r="100%"
    >
      <Stop offset={0} stopColor="#fce16b" />
      <Stop offset={0.11} stopColor="#fce16b" />
      <Stop offset={0.205} stopColor="#fce06a" />
      <Stop offset={0.288} stopColor="#fcdf69" />
      <Stop offset={0.36} stopColor="#fcdd68" />
      <Stop offset={0.424} stopColor="#fbda66" />
      <Stop offset={0.483} stopColor="#fbd764" />
      <Stop offset={0.537} stopColor="#fbd361" />
      <Stop offset={0.591} stopColor="#facf5e" />
      <Stop offset={0.644} stopColor="#fac959" />
      <Stop offset={0.701} stopColor="#f9c254" />
      <Stop offset={0.763} stopColor="#f8bb4e" />
      <Stop offset={0.832} stopColor="#f8b147" />
      <Stop offset={0.91} stopColor="#f7a73d" />
      <Stop offset={1} stopColor="#f69a31" />
    </RadialGradient>
    <RadialGradient
      id="b"
      cy="100%"
      gradientTransform="matrix(0 -1 1.136 0 -.636 1.5)"
      r="100%"
    >
      <Stop offset={0} stopColor="#83370e" />
      <Stop offset={0.226} stopColor="#83370e" />
      <Stop offset={1} stopColor="#482213" />
    </RadialGradient>
    <RadialGradient
      id="c"
      cy="0%"
      gradientTransform="matrix(0 1 -.7355 0 .5 -.5)"
      r="100%"
    >
      <Stop offset={0} stopColor="#f75b73" />
      <Stop offset={1} stopColor="#c51f2d" />
    </RadialGradient>
    <LinearGradient id="f" x1="85.463%" y1="19.628%" y2="80.372%">
      <Stop offset={0} stopColor="#222845" />
      <Stop offset={0.086} stopColor="#222845" />
      <Stop offset={0.166} stopColor="#232946" />
      <Stop offset={0.239} stopColor="#232b48" />
      <Stop offset={0.308} stopColor="#242d4a" />
      <Stop offset={0.374} stopColor="#262f4c" />
      <Stop offset={0.438} stopColor="#27314e" />
      <Stop offset={0.5} stopColor="#283350" />
      <Stop offset={0.562} stopColor="#293552" />
      <Stop offset={0.626} stopColor="#2a3754" />
      <Stop offset={0.692} stopColor="#2b3956" />
      <Stop offset={0.761} stopColor="#2c3a58" />
      <Stop offset={0.834} stopColor="#2c3b59" />
      <Stop offset={0.914} stopColor="#2d3c5a" />
      <Stop offset={1} stopColor="#2d3c5a" />
    </LinearGradient>
    <G fill="none" fillRule="evenodd">
      <Circle cx={96} cy={96} fill="url(#a)" r={96} />
      <Path
        d="M96 166c38.66 0 64-31.34 64-70 0-.66-7-13-64-13S32 95.34 32 96c0 38.66 25.34 70 64 70z"
        fill="url(#b)"
      />
      <Path
        d="M52.272 148.44C60.808 139.232 77.192 133 96 133s35.192 6.231 43.728 15.44C128.75 159.368 113.785 166 96 166s-32.75-6.633-43.728-17.56z"
        fill="url(#c)"
      />
      <Path
        d="M143.907 39.169c-8.207 2.389-27.788 13.373-30.542 17.594s-.61 9.333 2.895 10.056c9.102 0 24.787 2.671 35.424 7.776 5.94 3.015 9.499-5.293 5.66-7.776-5.597-4.395-14.439-7.194-26.525-8.397.991-3.035 12.582-8.024 18.07-10.617 5.49-2.593 3.226-11.026-4.982-8.636z"
        fill="#fff3c5"
        filter="url(#d)"
        opacity={0.449}
      />
      <Path
        d="M64.797 39.169C56.59 41.558 37.01 52.542 34.255 56.763s-.61 9.333 2.895 10.056c9.102 0 24.787 2.671 35.424 7.776 5.94 3.015 9.499-5.293 5.66-7.776-5.597-4.395-14.439-7.194-26.525-8.397.991-3.035 12.583-8.024 18.071-10.617 5.488-2.593 3.225-11.026-4.983-8.636z"
        fill="#fff3c5"
        filter="url(#e)"
        opacity={0.449}
        transform="matrix(-1 0 0 1 112.83 0)"
      />
      <Path
        d="M143.907 35.169c-8.207 2.389-27.788 13.373-30.542 17.594s-.61 9.333 2.895 10.056c9.102 0 24.787 2.671 35.424 7.776 5.94 3.015 9.499-5.293 5.66-7.776-5.597-4.395-14.439-7.194-26.525-8.397.991-3.035 12.582-8.024 18.07-10.617 5.49-2.593 3.226-11.026-4.982-8.636zm-95.875 0c8.208 2.389 27.789 13.373 30.543 17.594s.61 9.333-2.896 10.056c-9.101 0-24.786 2.671-35.423 7.776-5.94 3.015-9.499-5.293-5.66-7.776 5.597-4.395 14.438-7.194 26.525-8.397-.992-3.035-12.583-8.024-18.071-10.617-5.489-2.593-3.225-11.026 4.982-8.636z"
        fill="url(#f)"
      />
    </G>
  </Svg>
);

export default LaughingEmoji;
