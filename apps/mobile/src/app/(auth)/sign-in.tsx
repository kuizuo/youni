import React, { useState } from 'react';
import { Image, TextInput } from 'react-native';
import { View, Text, } from '@/components/Themed'

import { useAuth } from '../../utils/ctx';
import { Link, Stack, router } from 'expo-router';
import { Pressable } from '@/components/Themed';
import { Google } from '@/ui';


export default function Screen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);

  const handleSignIn = async () => {
    if (!email || !password) {

      // setError('Please enter both email and password');
    } else {
      try {
        // await signIn({ username: email, password })

        router.replace('/');

      } catch (error) {
        // setError('Failed to sign in');
      }
    }
  };


  function handleGoogleSignIn() {
  }

  function handleFaceBookSignIn() {
  }

  function handleWechatSignIn() {
    alert('Wechat sign in is not implemented yet');
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Stack.Screen options={{ headerShown: false }} />
      <Image source={require('../../../assets/images/icon.png')} className='mb-16' style={{ width: 100, height: 100, borderRadius: 50 }} />

      <View className='w-9/12'>
        <View className='flex gap-4 mb-4'>
          <TextInput
            placeholder="请输入账号"
            placeholderTextColor={'gray'}
            value={email}
            onChangeText={setEmail}
            className="border-b border-gray-300 p-2 w-full"
          />
          <TextInput
            placeholder="请输入密码"
            placeholderTextColor={'gray'}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="border-b border-gray-300 p-2 w-full"
          />
          <View className='w-full px-2 flex flex-row justify-between'>
            <Link href='/sign-up'>
              <Text className="text-blue-300 dark:text-blue-300">注册账号</Text>
            </Link >
            <Link href='/forgetPassword'>
              <Text className="text-blue-300 dark:text-blue-300">忘记密码?</Text>
            </Link >
          </View>

          <Pressable onPress={handleSignIn} >
            <Text className="mx-42 disabled:bg-gray-200 text-center text-white text-base bg-primary py-2 px-3 rounded-3xl font-semibold">登录</Text>
          </Pressable>

          <Text className="relative text-center text-gray-400 flex gap-2 items-center my-2 text-sm truncate
    before:content-[''] before:top-[50%] before:w-[50%] before:translate-y-[50%] before:border-t before:border-dashed before:border-gray-300 dark:border-gray-800)
    after:content-[''] after:top-[50%] after:w-[50%] after:translate-y-[50%] after:border-t after:border-dashed after:border-gray-300 dark:border-gray-800)
    ">
            其他登录方式
          </Text>
        </View>

        <View className='flex flex-row justify-center gap-12'>
          <Pressable onPress={handleWechatSignIn}>
            <Google style={{ width: 32, height: 32 }} />
          </Pressable>

          {/* <Pressable onPress={handleGoogleSignIn}>
            <Image source={require('@/assets/icons/LogosGoogle.png')} style={{ width: 32, height: 32 }} />
          </Pressable>

          <Pressable onPress={handleFaceBookSignIn}>
            <Image source={require('@/assets/icons/LogosFacebook.png')} style={{ width: 32, height: 32 }} />
          </Pressable> */}
        </View>
      </View>
    </View>
  );
}
