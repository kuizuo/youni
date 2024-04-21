import React, { useState } from 'react'
import {
  ArrowLeftIcon,
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
  Text,
  Toast,
  ToastTitle,
  VStack,
  useToast,
} from '@gluestack-ui/themed'
import { Link, useRouter } from 'expo-router'

import { Controller, useForm } from 'react-hook-form'

import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { AlertTriangle, EyeIcon, EyeOffIcon } from 'lucide-react-native'

import { Keyboard } from 'react-native'
import GuestLayout from '../../layouts/GuestLayout'
import { GoogleIcon, QQIcon, WechatIcon } from './assets/Icons/Social'
import { NavButton } from '@/ui/components/NavButton'

import { useAuth } from '@/utils/auth'

const signUpSchema = z.object({
  email: z.string().min(1, '邮箱必填').email({ message: '请输入正确的邮箱地址' }),
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .regex(new RegExp('.*[A-Za-z].*'), '至少包含一个字母')
    .regex(new RegExp('.*\\d.*'), '至少包含一个数字'),
  confirmpassword: z
    .string()
    .min(6, '确认密码至少需要6个字符')
    .regex(new RegExp('.*[A-Za-z].*'), '至少包含一个字母')
    .regex(new RegExp('.*\\d.*'), '至少包含一个数字'),
  rememberme: z.boolean().optional(),
})
type SignUpSchemaType = z.infer<typeof signUpSchema>
function SideContainerWeb() {
  return (
    <Center
      bg="$primary400"
      flex={1}
      sx={{
        _dark: {
          bg: '$primary500',
        },
      }}
    >
      <Image
        h="$10"
        w="$80"
        alt="gluestack-ui Pro"
        resizeMode="contain"
        source={require('./assets/images/logo.svg')}
      />
    </Center>
  )
}
function MobileHeader() {
  return (
    <VStack px="$3" mt="$4.5" mb="$5" space="md">
      <HStack space="md" alignItems="center">
        <NavButton.Back color="white" />
        <Text
          color="$textLight50"
          sx={{ _dark: { color: '$textDark50' } }}
          fontSize="$lg"
        >
          注册
        </Text>
      </HStack>
      <VStack space="xs" ml="$1" my="$4">
        <Heading color="$textLight50" sx={{ _dark: { color: '$textDark50' } }}>
          Youni
        </Heading>
        {/* <Text
          color="$primary300"
          fontSize="$md"
          sx={{
            _dark: {
              color: '$textDark400',
            },
          }}
        >
          注册
        </Text> */}
      </VStack>
    </VStack>
  )
}
function SignUpForm() {
  const router = useRouter()

  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<SignUpSchemaType>({
    resolver: zodResolver(signUpSchema),
  })
  const [isEmailFocused, setIsEmailFocused] = useState(false)
  const [pwMatched, setPwMatched] = useState(false)
  const toast = useToast()

  const { register: { isLoading, mutateAsync: registerApi } } = useAuth()

  const onSubmit = async (_data: SignUpSchemaType) => {
    if (_data.password === _data.confirmpassword) {
      setPwMatched(true)

      try {
        await registerApi({
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
        placement: 'bottom right',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant="accent" action="success">
              <ToastTitle>注册成功</ToastTitle>
            </Toast>
          )
        },
      })
      reset()
      router.replace('/login')
    }
    else {
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} action="error">
              <ToastTitle>密码不正确</ToastTitle>
            </Toast>
          )
        },
      })
    }
    // Implement your own onSubmit and navigation logic here.
  }
  const handleKeyPress = () => {
    Keyboard.dismiss()
    handleSubmit(onSubmit)()
  }
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const handleState = () => {
    setShowPassword((showState) => {
      return !showState
    })
  }
  const handleConfirmPwState = () => {
    setShowConfirmPassword((showState) => {
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
                  await signUpSchema.parseAsync({ email: value })
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
                  placeholder="邮箱"
                  fontSize="$sm"
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
            <FormControlErrorIcon size="md" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.email?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
        <FormControl isInvalid={!!errors.password} isRequired={true} my="$6">
          <Controller
            defaultValue=""
            name="password"
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({
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
            <FormControlErrorIcon size="sm" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.password?.message}
            </FormControlErrorText>
          </FormControlError>
          <FormControlHelper></FormControlHelper>
        </FormControl>
        <FormControl isInvalid={!!errors.confirmpassword} isRequired={true}>
          <Controller
            defaultValue=""
            name="confirmpassword"
            control={control}
            rules={{
              validate: async (value) => {
                try {
                  await signUpSchema.parseAsync({
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
                  placeholder="确认密码"
                  fontSize="$sm"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  onSubmitEditing={handleKeyPress}
                  returnKeyType="done"
                  type={showConfirmPassword ? 'text' : 'password'}
                />

                <InputSlot onPress={handleConfirmPwState} pr="$3">
                  <InputIcon as={showConfirmPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>
            )}
          />
          <FormControlError>
            <FormControlErrorIcon size="sm" as={AlertTriangle} />
            <FormControlErrorText>
              {errors?.confirmpassword?.message}
            </FormControlErrorText>
          </FormControlError>
        </FormControl>
      </VStack>
      <Controller
        name="rememberme"
        defaultValue={false}
        control={control}
        render={({ field: { onChange, value } }) => (
          <Checkbox
            size="sm"
            value="Remember me"
            isChecked={value}
            onChange={onChange}
            alignSelf="flex-start"
            mt="$5"
          >
            <CheckboxIndicator mr="$2">
              <CheckboxIcon as={CheckIcon} />
            </CheckboxIndicator>
            <CheckboxLabel
              sx={{
                _text: {
                  fontSize: '$sm',
                },
              }}
            >
              我接受
              {' '}
              <Link href="#">
                <LinkText
                  sx={{
                    _ios: {
                      marginTop: '$0.5',
                    },
                    _android: {
                      marginTop: '$0.5',
                    },
                  }}
                >
                  使用条款
                </LinkText>
              </Link>
              {' '}
              &
              {' '}
              <Link href="#">
                <LinkText
                  sx={{
                    _ios: {
                      marginTop: '$0.5',
                    },
                    _android: {
                      marginTop: '$0.5',
                    },
                  }}
                >
                  隐私政策
                </LinkText>
              </Link>
            </CheckboxLabel>
          </Checkbox>
        )}
      />
      <Button
        variant="solid"
        size="lg"
        mt="$5"
        disabled={isLoading}
        onPress={handleSubmit(onSubmit)}
      >
        <ButtonText fontSize="$sm">注册</ButtonText>
      </Button>
    </>
  )
}
function SignUpFormComponent() {
  return (
    <>
      <Box sx={{ '@md': { display: 'none' } }}>
        <MobileHeader />
      </Box>
      <Box
        flex={1}
        bg="$backgroundLight0"
        sx={{
          '@md': {
            px: '$8',
            borderTopLeftRadius: '$none',
            borderTopRightRadius: '$none',
            borderBottomRightRadius: '$none',
          },
          '_dark': {
            bg: '$backgroundDark800',
          },
        }}
        px="$4"
        py="$8"
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
          注册
        </Heading>
        <SignUpForm />
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
          sx={{
            '@md': {
              mt: '$4',
            },
          }}
          mt="$6"
          mb="$9"
          alignItems="center"
          justifyContent="center"
          space="lg"
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
            sx={{
              _dark: {
                color: '$textDark400',
              },
            }}
            fontSize="$sm"
          >
            已有账户?
          </Text>
          <Link href="/login">
            <LinkText fontSize="$sm">登录</LinkText>
          </Link>
        </HStack>
      </Box>
    </>
  )
}
export function SignUpScreen() {
  return (
    <GuestLayout>
      <Box
        sx={{
          '@md': {
            display: 'flex',
          },
        }}
        flex={1}
        display="none"
      >
        <SideContainerWeb />
      </Box>
      <Box flex={1}>
        <SignUpFormComponent />
      </Box>
    </GuestLayout>
  )
}
