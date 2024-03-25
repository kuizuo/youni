import type { ReactNode } from 'react'
import type {
  ControllerProps,
  FieldPath,
  FieldValues,
} from 'react-hook-form'
import {
  Controller,
} from 'react-hook-form'
import type { ViewStyle } from 'react-native'
import { Text, View } from 'react-native'

interface FormControlProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends ControllerProps<TFieldValues, TName> {
  label?: string
  style?: ViewStyle
  extra?: ReactNode
}

export default function FormControl<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  label,
  style,
  render,
  extra,
  ...rest
}: FormControlProps<TFieldValues, TName>) {
  return (
    <Controller
      {...rest}
      render={props => (
        <View style={style}>
          <View>
            {!!label && <Text>{label}</Text>}

            {extra}
          </View>
          {render(props)}
          <View>
            {!!props.fieldState.error?.message && (
              <Text>{props.fieldState.error?.message}</Text>
            )}
          </View>
        </View>
      )}
    />
  )
}
