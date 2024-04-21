import React, { useState } from 'react'
import {
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Center,
  CheckIcon,
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  Divider,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlHelper,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  LinkText,
  Pressable,
  Text,
  Toast,
  ToastTitle,
  VStack,
  useToast,
} from '@gluestack-ui/themed'

import { Link, useRouter } from 'expo-router'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Keyboard } from 'react-native'

import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native'

import GuestLayout from '../../layouts/GuestLayout'
import { GoogleIcon, QQIcon, WechatIcon } from './assets/Icons/Social'
import { useAuth } from '@/utils/auth'

const signInSchema = z.object({
  email: z.string().min(1, '账号必填'), // .email({ message: '无效的邮箱格式' }),
  password: z
    .string()
    .min(6, '长度必须至少为6个字符'),
  // .regex(new RegExp('.*[A-Z].*'), 'One uppercase character')
  // .regex(new RegExp('.*[a-z].*'), 'One lowercase character')
  // .regex(new RegExp('.*\\d.*'), 'One number')
  // .regex(
  //   new RegExp('.*[`~<>?,./!@#$%^&*()\\-_+="\'|{}\\[\\];:\\\\].*'),
  //   'One special character',
  // ),
  rememberme: z.boolean().optional(),
})

type SignInSchemaType = z.infer<typeof signInSchema>

function SignInForm() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignInSchemaType>({
    resolver: zodResolver(signInSchema),
  })
  const [isEmailFocused, setIsEmailFocused] = useState(false)

  const router = useRouter()
  const toast = useToast()
  const { login: { isLoading, mutateAsync: loginApi } } = useAuth()

  const onSubmit = async (_data: SignInSchemaType) => {
    try {
      await loginApi({
        username: _data.email,
        password: _data.password,
      })
    }
    catch (error) {
      toast.show({
        placement: 'top right',
        render: ({ id }) => {
          const toastId = `toast-${id}`

          return (
            <Toast nativeID={toastId} variant="accent" action="error">
              <ToastTitle>{error.message}</ToastTitle>
            </Toast>
          )
        },
      })
      return
    }

    toast.show({
      placement: 'top right',
      render: ({ id }) => {
        const toastId = `toast-${id}`

        return (
          <Toast nativeID={toastId} variant="accent" action="success">
            <ToastTitle>登录成功</ToastTitle>
          </Toast>
        )
      },
    })
    reset()
    router.push('/')
  }

  const handleKeyPress = () => {
    Keyboard.dismiss()
    handleSubmit(onSubmit)()
  }

  const [showPassword, setShowPassword] = useState(false)

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState
    })
  }

  return (
    <>
      <VStack justifyContent="space-between">
        <FormControl
          isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
          isRequired={true}
        >
          <Controller
            name="email"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signInSchema.parseAsync({ email: value })
                  return true
                }
                catch (error: any) {
                  return error.message
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  fontSize="$sm"
                  placeholder="账户/邮箱"
                  type="text"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                />
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} size="md" />
            <FormControlErrorText>
              {errors?.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>

        <FormControl my="$6" isInvalid={!!errors.password} isRequired={true}>
          <Controller
            name="password"
            defaultValue=""
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signInSchema.parseAsync({
                    password: value,
                  })
                  return true
                }
                catch (error: any) {
                  return error.message
                }
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input>
                <InputField
                  fontSize="$sm"
                  placeholder="密码"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                  type={showPassword ? 'text' : 'password'}
                />
                <InputSlot onPress={handleState} pr="$3">
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon as={AlertTriangle} size="sm" />
            <FormControlErrorText>
              {errors?.password?.message}
            </FormControlErrorText>
          </FormControlError>

          <FormControlHelper></FormControlHelper>
        </FormControl>
      </VStack>
      <Link href="/forgot-password">
        <LinkText fontSize="$xs" ml="auto">
          忘记密码?
        </LinkText>
      </Link>
      <Controller
        name="rememberme"
        defaultValue={false}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Checkbox
            my="$5"
            size="sm"
            value="Remember me"
            isChecked={value}
            onChange={onChange}
            alignSelf="flex-start"
          >
            <CheckboxIndicator mr="$2">
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel>记住密码</CheckboxLabel>
          </Checkbox>
        )}
      />
      <Button
        variant="solid"
        size="lg"
        mt="$5"
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      >
        <ButtonText fontSize="$sm">
          {isLoading ? '登录中' : '登录'}
        </ButtonText>
      </Button>
    </>
  )
}

function SideContainerWeb() {
  return (
    <Center
      flex={1}
      bg="$primary400"
      sx={{
        _dark: { bg: '$primary500' },
      }}
    >
      <Image
        w="$10"
        h="$10"
        resizeMode="contain"
        source={require('./assets/images/logo.svg')}
        alt="logo"
      />
    </Center>
  )
}

function MobileHeader() {
  return (
    <VStack px="$3" mt="$4.5" space="md">
      {/* <HStack space="md" alignItems="center">
        <Text
          color="$textLight50"
          sx={{ _dark: { color: '$textDark50' } }}
          fontSize="$lg"
        >
          登录
        </Text>
      </HStack> */}
      <VStack space="xs" ml="$1" my="$4">
        <Heading color="$textLight50" sx={{ _dark: { color: '$textDark50' } }}>
          Youni
        </Heading>
        <Text
          fontSize="$md"
          fontWeight="normal"
          color="$primary300"
          sx={{
            _dark: { color: '$textDark400' },
          }}
        >
          登录
        </Text>
      </VStack>
    </VStack>
  )
}

function Main() {
  return (
    <>
      <Box sx={{ '@md': { display: 'none' } }}>
        <MobileHeader />
      </Box>
      <Box
        px="$4"
        sx={{
          '@md': {
            px: '$8',
            borderTopLeftRadius: '$none',
            borderTopRightRadius: '$none',
            borderBottomRightRadius: '$none',
          },
          '_dark': { bg: '$backgroundDark800' },
        }}
        py="$8"
        flex={1}
        bg="$backgroundLight0"
        justifyContent="space-between"
        borderTopLeftRadius="$2xl"
        borderTopRightRadius="$2xl"
        borderBottomRightRadius="$none"
      >
        <Heading
          display="none"
          mb="$8"
          sx={{
            '@md': { display: 'flex', fontSize: '$2xl' },
          }}
        >
          登录
        </Heading>
        <SignInForm />
        <HStack my="$4" space="md" alignItems="center" justifyContent="center">
          <Divider
            w="$2/6"
            bg="$backgroundLight200"
            sx={{ _dark: { bg: '$backgroundDark700' } }}
          />
          <Text
            fontWeight="$medium"
            color="$textLight400"
            sx={{ _dark: { color: '$textDark300' } }}
          >
            or
          </Text>
          <Divider
            w="$2/6"
            bg="$backgroundLight200"
            sx={{ _dark: { bg: '$backgroundDark700' } }}
          />
        </HStack>
        <HStack
          mt="$6"
          sx={{
            '@md': {
              mt: '$4',
            },
          }}
          mb="$9"
          justifyContent="center"
          alignItems="center"
          space="xl"
        >
          <Link href="#">
            <Button action="secondary" variant="link" onPress={() => { }}>
              <ButtonIcon as={WechatIcon} size="xl" />
            </Button>
          </Link>
          <Link href="#">
            <Button action="secondary" variant="link" onPress={() => { }}>
              <ButtonIcon as={QQIcon} size="xl" />
            </Button>
          </Link>
          <Link href="#">
            <Button action="secondary" variant="link" onPress={() => { }}>
              <ButtonIcon as={GoogleIcon} size="xl" />
            </Button>
          </Link>
        </HStack>
        <HStack
          space="xs"
          alignItems="center"
          justifyContent="center"
          mt="auto"
        >
          <Text
            color="$textLight500"
            fontSize="$sm"
            sx={{ _dark: { color: '$textDark400' } }}
          >
            没有账户?
          </Text>
          <Link href="/signup">
            <LinkText fontSize="$sm">注册</LinkText>
          </Link>
        </HStack>
      </Box>
    </>
  )
}

export function SignInScreen() {
  return (
    <GuestLayout>
      <Box display="none" sx={{ '@md': { display: 'flex' } }} flex={1}>
        <SideContainerWeb />
      </Box>

      <Box flex={1}>
        <Main />
      </Box>
    </GuestLayout>
  )
}
