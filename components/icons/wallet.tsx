import React from "react";
import Svg, { Path, Rect } from "react-native-svg";

interface Props {
  active: boolean;
  color: string;
  size?: number;
}

export function WalletIcon({ active, color, size = 24 }: Props) {
  if (active) {
    return (
      <Svg width={size} height={(size * 20) / 24} viewBox="0 0 24 20" fill="none">
        <Path
          d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
          fill={color}
        />
        <Path
          d="M1 9H23"
          stroke="white"
          strokeWidth="1.5"
        />
        <Path
          d="M3 1L21 1"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Rect x="16" y="13" width="4" height="3" rx="1" fill="white" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={(size * 20) / 24} viewBox="0 0 24 20" fill="none">
      <Path
        d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
      />
      <Path
        d="M1 9H23"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M3 1L21 1"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Rect x="16" y="12.5" width="4" height="3" rx="1" stroke={color} strokeWidth="1.2" />
    </Svg>
  );
}