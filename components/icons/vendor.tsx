import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  active: boolean;
  color: string;
  size?: number;
}

export function VendorIcon({ active, color, size = 24 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {active ? (
        <Path
          d="M20 4H4v2l8 5 8-5V4zm0 4.236l-8 5-8-5V20h16V8.236z"
          fill={color}
        />
      ) : (
        <Path
          d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
          fill={color}
        />
      )}
    </Svg>
  );
}