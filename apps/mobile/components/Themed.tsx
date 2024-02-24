/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import {
  Text as DefaultText,
  View as DefaultView,
  Button as DefaultButton
} from 'react-native';

export function Text(props: DefaultText['props']) {
  const { className, ...otherProps } = props;

  return <DefaultText {...otherProps} />;
}

export function View(props: DefaultView['props']) {
  const { className, ...otherProps } = props;

  return <DefaultView  {...otherProps} />;
}
