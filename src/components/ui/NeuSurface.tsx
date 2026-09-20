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
  level?: Level;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
};

/**
 * Nested ambient + contact shadows. Outer shell always fills parent width
 * so grid cards don't collapse.
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
        {
          borderRadius: borderRadius + 2,
          backgroundColor: 'transparent',
          width: '100%',
          alignSelf: 'stretch',
        },
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
            width: '100%',
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}
