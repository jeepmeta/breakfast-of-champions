import { View, type StyleProp, type ViewStyle } from 'react-native';

import {
  ambientHost,
  contactFace,
  type ElevationName,
} from '../../theme/shadows';
import { neu } from '../../theme/neumorph';

type Level = Exclude<ElevationName, 'flat' | 'inset'>;

type Props = {
  children: React.ReactNode;
  /** soft | card | float | cta */
  level?: Level;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
};

/**
 * True multi-layer depth via nested views:
 * outer ambient shell + inner contact face.
 * Works on all RN platforms without New Arch boxShadow.
 */
export function NeuSurface({
  children,
  level = 'card',
  style,
  contentStyle,
  borderRadius = 20,
  backgroundColor = neu.card,
  borderColor = neu.borderSoft,
  borderWidth = 1.5,
}: Props) {
  return (
    <View
      style={[
        ambientHost(level),
        { borderRadius: borderRadius + 2, backgroundColor: 'transparent' },
        style,
      ]}
    >
      <View
        style={[
          contactFace(level),
          {
            borderRadius,
            backgroundColor,
            borderWidth,
            borderColor,
            overflow: 'hidden',
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
