/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  Text as DefaultText,
  View as DefaultView,
  Pressable as DefaultPressable,
  PressableProps
} from 'react-native';

export function Text(props: DefaultText['props']) {
  const { className, ...otherProps } = props;

  return <DefaultText className={`dark:text-white ${className}`} {...otherProps} />;
}

export function View(props: DefaultView['props']) {
  const { className, ...otherProps } = props;

  return <DefaultView className={`dark:bg-zinc-800 ${className}`} {...otherProps} />;
}

export function Pressable(props: PressableProps & React.RefAttributes<DefaultView>) {
  const { className, ...otherProps } = props;

  return <DefaultPressable className={`dark:bg-zinc-800 ${className}`} {...otherProps} />;
}
