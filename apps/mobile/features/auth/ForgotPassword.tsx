import React, { useState } from 'react'
import {
  ArrowLeftIcon,
  Box,
  Button,
  ButtonText,
  Center,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  HStack,
  Heading,
  Icon,
  Image,
  Input,
  InputField,
  Text,
  VStack,
} from '@gluestack-ui/themed'
import Toast from 'react-native-toast-message'
import { Link } from 'solito/link'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Keyboard } from 'react-native'

import { AlertTriangle } from 'lucide-react-native'

import { useRouter } from 'solito/router'
import GuestLayout from '../../layouts/GuestLayout'

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email(),
})

type forgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>

function Header() {
  return (
    <HStack space="md" px="$3" py="$4.5" alignItems="center">
      <Link href="#">
        <Icon
          size="md"
          as={ArrowLeftIcon}
          color="$textLight50"
          sx={{ _dark: { color: '$textDark50' } }}
        />
      </Link>
      <Text
        color="$textLight50"
        fontSize="$lg"
        sx={{ _dark: { color: '$textDark50' } }}
      >
        忘记密码
      </Text>
    </HStack>
  )
}

function SideContainerWeb() {
  return (
    <Center
      sx={{
        '@base': {
          _light: { bg: '$backgroundLight0' },
          _dark: { bg: '$backgroundDark800' },
        },
        '@md': {
          flex: 1,
          _light: { bg: '$primary500' },
          _dark: { bg: '$primary500' },
          py: '$48',
        },
      }}
    >
      <Image
        resizeMode="contain"
        w={200}
        h="$40"
        source={require('./assets/images/forgotPassword_web_dark.png')}
        alt="Alternate Text"
      />
    </Center>
  )
}
function MobileScreenImage() {
  return (
    <Center
      px="$4"
      mb={-0.5}
      sx={{
        '@base': {
          _light: { bg: '$backgroundLight0' },
          _dark: { bg: '$backgroundDark800' },
        },
        '@md': {
          py: '$48',
          px: '$12',
          _light: { bg: '$primary500' },
          _dark: { bg: '$primary700' },
        },
      }}
    >
      <Image
        sx={{
          '@base': {
            _light: { display: 'flex' },
            _dark: { display: 'none' },
            mt: '$12',
          },
          '@md': {
            _light: { display: 'none' },
            _dark: { display: 'none' },
          },
        }}
        source={require('./assets/images/forgotPassword_mobile_light.png')}
        h="$40"
        w="$48"
        resizeMode="contain"
        alignSelf="center"
        alt="Forgot Password"
      />
      <Image
        sx={{
          '@base': {
            _light: { display: 'none', _dark: { display: 'flex' } },
            mt: '$12',
          },
          '@md': { display: 'none' },
        }}
        source={require('./assets/images/forgotPassword_mobile_dark.png')}
        h="$40"
        w="$48"
        resizeMode="contain"
        alignSelf="center"
        alt="Forgot Password"
      />
    </Center>
  )
}

export default function ForgotPassword() {
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<forgotPasswordSchemaType>({
    resolver: zodResolver(forgotPasswordSchema),
  })
  const [isEmailFocused, setIsEmailFocused] = useState(false)

  const router = useRouter()

  const onSubmit = (_data: forgotPasswordSchemaType) => {
    router.push('/verify-otp')
    reset()
    Toast.show({
      type: 'success',
      position: 'bottom',
      text1: 'OTP Send Successfully',
    })

    reset()
  }

  const handleKeyPress = () => {
    Keyboard.dismiss()
    handleSubmit(onSubmit)()
  }

  return (
    <GuestLayout>
      <VStack
        sx={{
          '@md': { flexDirection: 'row' },
          '_dark': { bg: '$backgroundDark900' },
        }}
        flex={1}
        bg="$primary400"
      >
        <Box sx={{ '@md': { display: 'none' } }}>
          <Header />
          <MobileScreenImage />
        </Box>
        <Box sx={{ '@md': { display: 'flex' } }} display="none" flex={1}>
          <SideContainerWeb />
        </Box>
        <Box
          maxWidth={508}
          pt="$0"
          pb="$8"
          px="$4"
          bg="$backgroundLight0"
          flex={1}
          sx={{
            '@md': {
              pt: '$8',
              px: '$8',
            },
            '_dark': { bg: '$backgroundDark800' },
          }}
        >
          <VStack
            space="md"
            alignItems="center"
            sx={{ '@md': { alignItems: 'flex-start' } }}
          >
            <Heading
              fontSize="$xl"
              textAlign="center"
              sx={{
                '@md': {
                  textAlign: 'left',
                  fontSize: '$2xl',
                },
              }}
            >
              忘记密码?
            </Heading>

            <Text
              fontSize="$sm"
              fontWeight="normal"
              textAlign="center"
              sx={{
                '@md': {
                  textAlign: 'left',
                },
              }}
            >
              Not to worry! Enter email address associated with your account and
              we'll send a link to reset your password.
            </Text>
          </VStack>

          <FormControl
            my="$8"
            isInvalid={(!!errors.email || isEmailFocused) && !!errors.email}
            isRequired={true}
          >
            <Controller
              defaultValue=""
              name="email"
              control={control}
              rules={{
                validate: async (value) => {
                  try {
                    await forgotPasswordSchema.parseAsync({
                      email: value,
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
                    placeholder="Email"
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
          <Button variant="solid" size="md" onPress={handleSubmit(onSubmit)}>
            <ButtonText fontSize="$sm">SUBMIT</ButtonText>
          </Button>
        </Box>
      </VStack>
    </GuestLayout>
  )
}
