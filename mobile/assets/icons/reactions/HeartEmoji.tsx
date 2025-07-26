import React from 'react';
import Svg, { Path, G, Circle, LinearGradient, Stop } from 'react-native-svg';
import { SvgProps } from 'react-native-svg';

const HeartEmoji: React.FC<SvgProps> = (props) => (
  <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" {...props}>
    <LinearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%">
      <Stop offset={0} stopColor="#f65e7a"/>
      <Stop offset={0.051} stopColor="#f65e7a"/>
      <Stop offset={0.1} stopColor="#f65d79"/>
      <Stop offset={0.146} stopColor="#f55c78"/>
      <Stop offset={0.191} stopColor="#f45b76"/>
      <Stop offset={0.233} stopColor="#f35974"/>
      <Stop offset={0.274} stopColor="#f25771"/>
      <Stop offset={0.314} stopColor="#f1546f"/>
      <Stop offset={0.353} stopColor="#f0526b"/>
      <Stop offset={0.39} stopColor="#ee4f68"/>
      <Stop offset={0.427} stopColor="#ed4b64"/>
      <Stop offset={0.464} stopColor="#eb4860"/>
      <Stop offset={0.5} stopColor="#e9445c"/>
      <Stop offset={0.536} stopColor="#e84057"/>
      <Stop offset={0.573} stopColor="#e63c53"/>
      <Stop offset={0.61} stopColor="#e5374e"/>
      <Stop offset={0.647} stopColor="#e33349"/>
      <Stop offset={0.686} stopColor="#e22e44"/>
      <Stop offset={0.726} stopColor="#e02940"/>
      <Stop offset={0.767} stopColor="#df253b"/>
      <Stop offset={0.809} stopColor="#de2037"/>
      <Stop offset={0.854} stopColor="#dd1c33"/>
      <Stop offset={0.9} stopColor="#dd1830"/>
      <Stop offset={0.949} stopColor="#dc152e"/>
      <Stop offset={1} stopColor="#dc142d"/>
    </LinearGradient>
    <G fill="none" fillRule="evenodd">
      <Circle cx="96" cy="96" fill="url(#a)" r="96"/>
      <Path d="M95.926 70.264c1.666-5.311 5.057-9.77 10.171-13.374 8.485-5.982 29.714-7.652 40.268 8.14 10.555 15.791 5.613 37.04-10.554 53.746-10.555 10.905-23.674 21.075-39.358 30.508a2 2 0 0 1-2.018.026c-13.021-7.386-26.062-17.564-39.12-30.534-20.1-19.962-21.546-37.989-10.773-53.747 10.772-15.757 31.73-14.12 40.215-8.14 5.115 3.606 8.52 8.065 10.215 13.377a.5.5 0 0 0 .954-.002z" fill="#fff"/>
    </G>
  </Svg>
);

export default HeartEmoji;