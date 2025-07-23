import * as React from "react";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
  Ellipse,
  G,
  Circle,
  Path,
  Use,
} from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */

const WowEmoji: React.FC<SvgProps> = (props) => (
  <Svg
    height={2500}
    width={2500}
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 192 192"
    {...props}
  >
    <Defs>
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
      <LinearGradient id="c" x1="10.909%" x2="85.942%" y1="55.621%" y2="50%">
        <Stop offset={0} stopColor="#d06a00" />
        <Stop offset={0.51} stopColor="#e18000" />
        <Stop offset={1} stopColor="#d47100" />
      </LinearGradient>
      <LinearGradient id="d" x1="50%" x2="50%" y1="15.514%" y2="100%">
        <Stop offset={0} stopColor="#d16c00" stopOpacity={0} />
        <Stop offset={1} stopColor="#ce6600" />
      </LinearGradient>
      <RadialGradient
        id="f"
        cx="47.795%"
        cy="72.401%"
        gradientTransform="matrix(-.13245 .79295 -.76649 -.08194 1.096 .404)"
        r="98.416%"
      >
        <Stop offset={0} stopColor="#3e4672" />
        <Stop offset={0.086} stopColor="#3e4671" />
        <Stop offset={0.166} stopColor="#3d446f" />
        <Stop offset={0.239} stopColor="#3b426c" />
        <Stop offset={0.308} stopColor="#394068" />
        <Stop offset={0.374} stopColor="#363c63" />
        <Stop offset={0.438} stopColor="#33395d" />
        <Stop offset={0.5} stopColor="#2f3556" />
        <Stop offset={0.562} stopColor="#2b304f" />
        <Stop offset={0.626} stopColor="#282b48" />
        <Stop offset={0.692} stopColor="#242640" />
        <Stop offset={0.761} stopColor="#202239" />
        <Stop offset={0.834} stopColor="#1c1d32" />
        <Stop offset={0.914} stopColor="#1a1a2e" />
        <Stop offset={1} stopColor="#19192c" />
      </RadialGradient>
      <Ellipse id="g" cx={136} cy={68} rx={16} ry={20} />
      <Ellipse id="i" cx={56} cy={68} rx={16} ry={20} />
      <LinearGradient id="l" x1="50%" x2="50%" y1="0%" y2="100%">
        <Stop offset={0} stopColor="#482314" />
        <Stop offset={0.084} stopColor="#492314" />
        <Stop offset={0.156} stopColor="#4d2414" />
        <Stop offset={0.219} stopColor="#512613" />
        <Stop offset={0.275} stopColor="#572813" />
        <Stop offset={0.327} stopColor="#5e2a12" />
        <Stop offset={0.378} stopColor="#642c12" />
        <Stop offset={0.429} stopColor="#6a2f11" />
        <Stop offset={0.483} stopColor="#703111" />
        <Stop offset={0.542} stopColor="#763310" />
        <Stop offset={0.608} stopColor="#7a350f" />
        <Stop offset={0.685} stopColor="#7e360f" />
        <Stop offset={0.775} stopColor="#81370e" />
        <Stop offset={0.879} stopColor="#83380e" />
        <Stop offset={1} stopColor="#84380e" />
      </LinearGradient>
    </Defs>
    <G fill="none" fillRule="evenodd">
      <Circle cx={96} cy={96} fill="url(#a)" r={96} />
      <Path
        d="M130.727 36.305c-.226.219-.525.695-2.227.695-1.228 0-2.338-.009-3.728-1.554-1.39-1.546-.568-3.605-.5-3.72a16.764 16.764 0 01.67-1.043 17.315 17.315 0 012.33-2.704C130.53 24.903 135.03 23 140 23s9.47 1.903 12.728 4.98c.87.822 1.653 1.728 2.331 2.704.313.45.425.586.87 1.392.445.807-.332 4.924-3.503 4.924-3.17 0-3.465-.994-3.607-1.233a8.934 8.934 0 00-.48-.725 9.365 9.365 0 00-1.272-1.404c-1.795-1.62-4.27-2.546-7.06-2.546s-5.28.926-7.074 2.546c-.474.428-.9.898-1.271 1.403-.338.46-.71 1.044-.935 1.264z"
        fill="#fff3c5"
        filter="url(#b)"
        opacity={0.449}
      />
      <Path
        d="M130.413 34.946c.101-.098.19-.22.614-.826l.07-.1a9.865 9.865 0 011.536-1.753c1.91-1.724 4.53-2.675 7.409-2.675 2.876 0 5.484.949 7.395 2.675a9.8 9.8 0 011.847 2.244c.333.56 1.151.989 3.178.989 2.244 0 3.996-2.78 3.065-4.182a11.679 11.679 0 00-.552-.929l-.038-.056a38.27 38.27 0 00-.253-.363 16.815 16.815 0 00-2.264-2.627c-3.261-3.08-7.674-4.843-12.385-4.843s-9.123 1.763-12.384 4.843a16.815 16.815 0 00-2.913 3.637 1.27 1.27 0 00-.112.24c-.267.735-.17 1.715.601 2.954 1.403 2.173 4.14 1.79 5.186.772z"
        fill="url(#c)"
        stroke="url(#d)"
        transform="matrix(-1 0 0 1 280.27 0)"
      />
      <Path
        d="M42.682 36.305c-.225.219-.524.695-2.227.695-1.228 0-2.338-.009-3.728-1.554-1.39-1.546-.567-3.605-.499-3.72a16.764 16.764 0 01.67-1.043 17.315 17.315 0 012.33-2.704C42.484 24.903 46.984 23 51.954 23c4.971 0 9.471 1.903 12.728 4.98a17.324 17.324 0 012.332 2.704c.312.45.425.586.87 1.392.445.807-.333 4.924-3.503 4.924s-3.465-.994-3.608-1.233a8.934 8.934 0 00-.48-.725 9.365 9.365 0 00-1.272-1.404c-1.794-1.62-4.27-2.546-7.06-2.546s-5.279.926-7.073 2.546c-.475.428-.9.898-1.272 1.403-.338.46-.71 1.044-.935 1.264z"
        fill="#fff3c5"
        filter="url(#e)"
        opacity={0.449}
        transform="matrix(-1 0 0 1 103.924 0)"
      />
      <Path
        d="M42.147 34.946c.101-.098.19-.22.614-.826l.07-.1a9.865 9.865 0 011.536-1.753c1.91-1.724 4.53-2.675 7.409-2.675 2.876 0 5.483.949 7.395 2.675.5.45.948.947 1.34 1.479.182.248.35.503.507.765.332.56 1.15.989 3.177.989 2.244 0 3.996-2.78 3.065-4.182-.25-.455-.396-.699-.551-.929l-.038-.056-.253-.363a16.815 16.815 0 00-2.265-2.627c-3.26-3.08-7.673-4.843-12.384-4.843s-9.123 1.763-12.385 4.843a16.815 16.815 0 00-2.912 3.637 1.27 1.27 0 00-.112.24c-.267.735-.17 1.715.6 2.954 1.404 2.173 4.14 1.79 5.187.772z"
        fill="url(#c)"
        stroke="url(#d)"
        transform="matrix(-1 0 0 1 103.738 0)"
      />
      <Use fill="url(#f)" xlinkHref="#g" />
      <Use fill="#000" filter="url(#h)" xlinkHref="#g" />
      <Ellipse
        cx={133}
        cy={61}
        fill="#595e7c"
        rx={5}
        ry={6}
        transform="rotate(8 133 61)"
      />
      <Use fill="url(#f)" xlinkHref="#i" />
      <Use fill="#000" filter="url(#j)" xlinkHref="#i" />
      <Ellipse
        cx={53}
        cy={61}
        fill="#595e7c"
        rx={5}
        ry={6}
        transform="rotate(8 53 61)"
      />
      <Path
        d="M97 173c22.06-.667 28-16.118 28-36 0-17.882-10.536-36-28-36s-28 18.118-28 36c0 18.882 5.94 36.667 28 36z"
        fill="#fff3c5"
        filter="url(#k)"
        opacity={0.449}
      />
      <Path
        d="M97 172c22.06-.667 28-16.118 28-36 0-17.882-10.536-36-28-36s-28 18.118-28 36c0 18.882 5.94 36.667 28 36z"
        fill="url(#l)"
      />
    </G>
  </Svg>
);

export default WowEmoji;
