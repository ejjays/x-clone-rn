import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';

const PeopleIcon = (props) => (
  <Svg
    width={props.size || 30}
    height={props.size || 30}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Circle
      cx="9"
      cy="7"
      r="3"
      stroke={props.color || '#333333'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 10C15.6569 10 17 8.65685 17 7C17 5.34315 15.6569 4 14 4"
      stroke={props.color || '#333333'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11 13H7C4.79086 13 3 14.7909 3 17C3 18.6569 4.34315 20 6 20H12C13.6569 20 15 18.6569 15 17C15 14.7909 13.2091 13 11 13Z"
      stroke={props.color || '#333333'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 13C19.2091 13 21 14.7909 21 17C21 18.6569 19.6569 20 18 20"
      stroke={props.color || '#333333'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default PeopleIcon;