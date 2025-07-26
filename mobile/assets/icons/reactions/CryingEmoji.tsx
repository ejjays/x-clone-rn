import React from 'react';
import Svg, { Path, G, Circle, LinearGradient, RadialGradient, Defs, Stop, Ellipse, Use, Filter, FeGaussianBlur, FeOffset, FeComposite, FeColorMatrix } from 'react-native-svg';
import { SvgProps } from 'react-native-svg';

const CryingEmoji: React.FC<SvgProps> = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 192 192" {...props}>
    <Defs>
      <RadialGradient id="a" cy="0%" gradientTransform="matrix(0 1 -1.26314 0 .5 -.5)" r="100%">
        <Stop offset={0} stopColor="#fce16b"/>
        <Stop offset={0.11} stopColor="#fce16b"/>
        <Stop offset={0.205} stopColor="#fce06a"/>
        <Stop offset={0.288} stopColor="#fcdf69"/>
        <Stop offset={0.36} stopColor="#fcdd68"/>
        <Stop offset={0.424} stopColor="#fbda66"/>
        <Stop offset={0.483} stopColor="#fbd764"/>
        <Stop offset={0.537} stopColor="#fbd361"/>
        <Stop offset={0.591} stopColor="#facf5e"/>
        <Stop offset={0.644} stopColor="#fac959"/>
        <Stop offset={0.701} stopColor="#f9c254"/>
        <Stop offset={0.763} stopColor="#f8bb4e"/>
        <Stop offset={0.832} stopColor="#f8b147"/>
        <Stop offset={0.91} stopColor="#f7a73d"/>
        <Stop offset={1} stopColor="#f69a31"/>
      </RadialGradient>
      <Filter id="b" height="119.9%" width="122.2%" x="-11.1%">
        <FeGaussianBlur in="SourceGraphic" stdDeviation="1"/>
      </Filter>
      <RadialGradient id="c" cx="47.795%" cy="72.401%" gradientTransform="matrix(-.14846 .88876 -.76473 -.10317 1.103 .374)" r="87.807%">
        <Stop offset={0} stopColor="#3e4672"/>
        <Stop offset={0.086} stopColor="#3e4671"/>
        <Stop offset={0.166} stopColor="#3d446f"/>
        <Stop offset={0.239} stopColor="#3b426c"/>
        <Stop offset={0.308} stopColor="#394068"/>
        <Stop offset={0.374} stopColor="#363c63"/>
        <Stop offset={0.438} stopColor="#33395d"/>
        <Stop offset={0.5} stopColor="#2f3556"/>
        <Stop offset={0.562} stopColor="#2b304f"/>
        <Stop offset={0.626} stopColor="#282b48"/>
        <Stop offset={0.692} stopColor="#242640"/>
        <Stop offset={0.761} stopColor="#202239"/>
        <Stop offset={0.834} stopColor="#1c1d32"/>
        <Stop offset={0.914} stopColor="#1a1a2e"/>
        <Stop offset={1} stopColor="#19192c"/>
      </RadialGradient>
      <Path id="d" d="M147.183 101.63c.555 4.085.555 4.085 0 8.5-.02.163-.043.327-.068.49a10 10 0 0 1-9.888 8.51h-6.397a10 10 0 0 1-9.951-9c-.476-4.266-.476-4.524 0-8.5.476-3.978 3.14-12.63 13.182-12.63s12.566 8.543 13.122 12.63z"/>
      <Filter id="e" height="110%" width="111.1%" x="-5.5%" y="-5%">
        <FeGaussianBlur in="SourceAlpha" result="shadowBlurInner1" stdDeviation="1"/>
        <FeOffset dy="-1" in="shadowBlurInner1" result="shadowOffsetInner1"/>
        <FeComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1" operator="arithmetic" result="shadowInnerInner1"/>
        <FeColorMatrix in="shadowInnerInner1" values="0 0 0 0 0.0611930497 0 0 0 0 0.0583983323 0 0 0 0 0.111497962 0 0 0 0.53944493 0"/>
      </Filter>
      <Filter id="f" height="119.9%" width="122.2%" x="-11.1%">
        <FeGaussianBlur in="SourceGraphic" stdDeviation="1"/>
      </Filter>
      <Path id="g" d="M71.183 101.63c.555 4.085.555 4.085 0 8.5-.02.163-.043.327-.068.49a10 10 0 0 1-9.888 8.51H54.83a10 10 0 0 1-9.951-9c-.476-4.266-.476-4.524 0-8.5C45.355 97.651 48.019 89 58.06 89c10.043 0 12.566 8.543 13.122 12.63z"/>
      <Filter id="h" height="110%" width="111.1%" x="-5.5%" y="-5%">
        <FeGaussianBlur in="SourceAlpha" result="shadowBlurInner1" stdDeviation="1"/>
        <FeOffset dy="-1" in="shadowBlurInner1" result="shadowOffsetInner1"/>
        <FeComposite in="shadowOffsetInner1" in2="SourceAlpha" k2="-1" k3="1" operator="arithmetic" result="shadowInnerInner1"/>
        <FeColorMatrix in="shadowInnerInner1" values="0 0 0 0 0.0611930497 0 0 0 0 0.0583983323 0 0 0 0 0.111497962 0 0 0 0.53944493 0"/>
      </Filter>
      <RadialGradient id="i" cy="90.573%" gradientTransform="matrix(0 -1 .80147 0 -.226 1.406)" r="86.652%">
        <Stop offset={0} stopColor="#85380e"/>
        <Stop offset={0.167} stopColor="#84380e"/>
        <Stop offset={0.308} stopColor="#83370e"/>
        <Stop offset={0.428} stopColor="#80360f"/>
        <Stop offset={0.527} stopColor="#7d350f"/>
        <Stop offset={0.609} stopColor="#78330f"/>
        <Stop offset={0.677} stopColor="#733210"/>
        <Stop offset={0.733} stopColor="#6e3010"/>
        <Stop offset={0.779} stopColor="#682e11"/>
        <Stop offset={0.818} stopColor="#622c11"/>
        <Stop offset={0.852} stopColor="#5c2912"/>
        <Stop offset={0.886} stopColor="#562712"/>
        <Stop offset={0.919} stopColor="#502613"/>
        <Stop offset={0.957} stopColor="#4b2413"/>
        <Stop offset={1} stopColor="#482313"/>
      </RadialGradient>
      <LinearGradient id="j" x1="50%" x2="50%" y1="100%" y2="0%">
        <Stop offset={0} stopColor="#1cc1fa"/>
        <Stop offset={0.086} stopColor="#1cc0f9"/>
        <Stop offset={0.166} stopColor="#1cbef7"/>
        <Stop offset={0.239} stopColor="#1dbbf4"/>
        <Stop offset={0.308} stopColor="#1db7f0"/>
        <Stop offset={0.374} stopColor="#1db2ec"/>
        <Stop offset={0.438} stopColor="#1eace7"/>
        <Stop offset={0.5} stopColor="#1ea6e1"/>
        <Stop offset={0.562} stopColor="#1ea0db"/>
        <Stop offset={0.626} stopColor="#1f9ad6"/>
        <Stop offset={0.692} stopColor="#1f94d1"/>
        <Stop offset={0.761} stopColor="#208ecc"/>
        <Stop offset={0.834} stopColor="#208ac8"/>
        <Stop offset={0.914} stopColor="#2087c6"/>
        <Stop offset={1} stopColor="#2086c5"/>
      </LinearGradient>
      <RadialGradient id="k" cy="100%" gradientTransform="matrix(0 -.56906 .3077 0 .192 1.285)" r="175.729%">
        <Stop offset={0} stopColor="#50c2f4"/>
        <Stop offset={1} stopColor="#94caed"/>
      </RadialGradient>
      <Filter id="l" height="120.6%" width="136.2%" x="-18.1%" y="-10.3%">
        <FeGaussianBlur in="SourceGraphic" stdDeviation="1"/>
      </Filter>
      <Filter id="m" height="122.3%" width="114.9%" x="-7.4%" y="-11.1%">
        <FeGaussianBlur in="SourceGraphic" stdDeviation="1"/>
      </Filter>
      <Filter id="n" height="122.3%" width="114.9%" x="-7.4%" y="-11.1%">
        <FeGaussianBlur in="SourceGraphic" stdDeviation="1"/>
      </Filter>
      <RadialGradient id="o" cx="11.513%" cy="10.489%" gradientTransform="matrix(.56123 .54226 -.21853 .50692 .073 -.01)" r="146.523%">
        <Stop offset={0} stopColor="#e5890a"/>
        <Stop offset={1} stopColor="#cc6400"/>
      </RadialGradient>
      <LinearGradient id="p" x1="13.395%" x2="81.092%" y1="33.941%" y2="62.135%">
        <Stop offset={0} stopColor="#e38609"/>
        <Stop offset={1} stopColor="#d16d09"/>
      </LinearGradient>
    </Defs>
    <G fill="none" fillRule="evenodd">
      <Circle cx="96" cy="96" fill="url(#a)" r="96"/>
      <Path d="M147.183 103.63c.555 4.085.555 4.085 0 8.5-.02.163-.043.327-.068.49a10 10 0 0 1-9.888 8.51h-6.397a10 10 0 0 1-9.951-9c-.476-4.266-.476-4.524 0-8.5.476-3.978 3.14-12.63 13.182-12.63s12.566 8.543 13.122 12.63z" fill="#fff3c5" filter="url(#b)" opacity=".449"/>
      <Use fill="url(#c)" xlinkHref="#d"/>
      <Use fill="#000" filter="url(#e)" xlinkHref="#d"/>
      <Ellipse cx="130.95" cy="97.65" fill="#595e7c" rx="4.75" ry="5.25" transform="matrix(-1 0 0 1 261.9 0)"/>
      <Path d="M71.183 103.63c.555 4.085.555 4.085 0 8.5-.02.163-.043.327-.068.49a10 10 0 0 1-9.888 8.51H54.83a10 10 0 0 1-9.951-9c-.476-4.266-.476-4.524 0-8.5C45.355 99.651 48.019 91 58.06 91c10.043 0 12.566 8.543 13.122 12.63z" fill="#fff3c5" filter="url(#f)" opacity=".449"/>
      <Use fill="url(#c)" xlinkHref="#g"/>
      <Use fill="#000" filter="url(#h)" xlinkHref="#g"/>
      <Ellipse cx="54.95" cy="97.65" fill="#595e7c" rx="4.75" ry="5.25" transform="matrix(-1 0 0 1 109.9 0)"/>
      <Path d="M96 135c15.333 0 26 6.5 32 19.5a3.93 3.93 0 0 1-5.839 4.197C113.441 153.566 104.721 151 96 151s-17.44 2.566-26.161 7.697A3.93 3.93 0 0 1 64 154.5c6-13 16.667-19.5 32-19.5z" fill="url(#i)"/>
      <Path d="M157.465 191c12.86 0 17.41-12.591 17.947-15.376.753-3.9.753-8.418-.999-15.507-1.053-4.26-13.268-33.117-16.948-33.117-3.678 0-15.913 28.756-16.972 33.004-1.763 7.077-1.763 12.743-1.034 15.474.73 2.731 5.145 15.522 18.006 15.522z" fill="url(#j)"/>
      <Path d="M157.763 166c9.063 0 7.818-9.517 7.649-11.052s-5.503-18.053-8.097-18.053c-2.592 0-7.995 15.662-8.242 17.949-.248 2.286-.374 11.156 8.69 11.156z" fill="url(#k)" filter="url(#l)"/>
      <Path d="M127.057 61.12c1.239-.9 2.825-1.274 4.757-1.12 7.465 1.122 13.96 3.98 19.486 8.574 8.289 6.89 13.007 13.576 13.007 15.865s-2.585 3.42-5.608 1.405-9.934-7.98-19.17-12.406c-9.236-4.428-14.192-2.987-15.237-5.511s.906-5.457 2.765-6.808z" fill="#9c750d" filter="url(#m)" opacity=".124"/>
      <Path d="M31.057 61.12c1.239-.9 2.825-1.274 4.757-1.12 7.465 1.122 13.96 3.98 19.486 8.574 8.289 6.89 13.007 13.576 13.007 15.865s-2.585 3.42-5.608 1.405c-3.022-2.015-9.934-7.98-19.17-12.406s-14.192-2.987-15.237-5.511.906-5.457 2.765-6.808z" fill="#9c750d" filter="url(#n)" opacity=".115" transform="matrix(-1 0 0 1 96.307 0)"/>
      <G fill="url(#o)" stroke="url(#p)">
        <Path d="M127.35 60.524c-2.101 1.527-3.413 4.237-2.596 6.212.296.713.998 1.066 2.84 1.466.376.082 1.897.388 2.175.446.996.208 1.857.409 2.755.65a41.048 41.048 0 0 1 7.221 2.689 75.381 75.381 0 0 1 7.229 3.988c3.903 2.428 12.675 8.901 12.003 8.453 2.56 1.706 4.83 1.003 4.83-.989 0-2.426-5.425-9.328-12.827-15.481-5.455-4.535-11.865-7.355-19.205-8.46-1.82-.144-3.289.2-4.425 1.026zM64.957 60.524c2.101 1.527 3.413 4.237 2.596 6.212-.296.713-.998 1.066-2.84 1.466-.376.082-1.897.388-2.175.446-.996.208-1.857.409-2.755.65a41.048 41.048 0 0 0-7.221 2.689 75.381 75.381 0 0 0-7.229 3.988c-3.903 2.428-12.675 8.901-12.003 8.453-2.56 1.706-4.83 1.003-4.83-.989 0-2.426 5.425-9.328 12.827-15.481 5.455-4.535 11.865-7.355-19.205-8.46 1.82-.144 3.289.2 4.425 1.026z"/>
      </G>
    </G>
  </Svg>
);

export default CryingEmoji;