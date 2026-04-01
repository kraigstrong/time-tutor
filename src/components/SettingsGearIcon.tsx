import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

import { palette } from '../styles/theme';

type Props = {
  size?: number;
};

const center = 12;
const toothCount = 8;
const outerRadius = 10.2;
const innerRadius = 7.7;
const toothHalfWidthDegrees = 10;

function polarToCartesian(radius: number, angleDegrees: number) {
  const angle = ((angleDegrees - 90) * Math.PI) / 180;

  return {
    x: center + radius * Math.cos(angle),
    y: center + radius * Math.sin(angle),
  };
}

function buildGearPath() {
  const points: Array<{ x: number; y: number }> = [];

  for (let index = 0; index < toothCount; index += 1) {
    const toothAngle = index * (360 / toothCount);

    points.push(polarToCartesian(innerRadius, toothAngle - toothHalfWidthDegrees));
    points.push(polarToCartesian(outerRadius, toothAngle - toothHalfWidthDegrees));
    points.push(polarToCartesian(outerRadius, toothAngle + toothHalfWidthDegrees));
    points.push(polarToCartesian(innerRadius, toothAngle + toothHalfWidthDegrees));
  }

  return points.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }, '').concat(' Z');
}

const gearPath = buildGearPath();

export function SettingsGearIcon({ size = 22 }: Props) {
  return (
    <Svg
      accessibilityElementsHidden
      focusable={false}
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <Path d={gearPath} fill={palette.ink} />
      <Circle cx={12} cy={12} fill={palette.surface} r={4.15} />
      <Circle cx={12} cy={12} fill={palette.teal} r={1.7} />
    </Svg>
  );
}
