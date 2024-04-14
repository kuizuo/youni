import { useState } from 'react'
import { Link } from 'expo-router'
import { Button, Image, Input, Paragraph, Stack, View } from '@/ui'

interface Props {
  type: 'sign-up' | 'sign-in'
  handleOAuthWithPress: (provider: 'wechat' | 'google' | 'apple') => void
  handleEmailWithPress: (email, password) => void
}

export function SignUpSignInComponent({
  type,
  handleOAuthWithPress,
  handleEmailWithPress,
}: Props): React.ReactNode {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <View
      className="rounded-xl gap-4 px-6 py-4 w-[350px] bg-background shadow-gray-100"
    >
      <Paragraph size="$5" fontWeight="700" opacity={0.8} marginBottom="$1">
        {type === 'sign-up' ? '创建你的账户' : '登录你的帐户'}
      </Paragraph>
      {/* all the oauth sign up options */}
      <View className="flex-row gap-4 justify-evenly">
        <Button
          size="$5"
          onPress={() => handleOAuthWithPress('wechat')}
          hoverStyle={{ opacity: 0.8 }}
          focusStyle={{ scale: 0.95 }}
          borderColor="$gray8Light"
        >
          <Image
            style={{ width: 25, height: 22 }}
            src={require('@/assets/icons/wechat-logo.png')}
            width={20}
            height={20}
            alt="Wechat Logo"
          />
        </Button>
        <Button
          size="$5"
          onPress={() => handleOAuthWithPress('google')}
          hoverStyle={{ opacity: 0.8 }}
          focusStyle={{ scale: 0.95 }}
          borderColor="$gray8Light"
        >
          <Image
            style={{ width: 20, height: 20 }}
            src={require('@/assets/icons/google-logo.png')}
            width={20}
            height={20}
            alt="Google Logo"
          />
        </Button>
        <Button
          size="$5"
          onPress={() => handleOAuthWithPress('apple')}
          hoverStyle={{ opacity: 0.8 }}
          focusStyle={{ scale: 0.95 }}
          borderColor="$gray8Light"
        >
          <Image
            style={{ width: 22, height: 22 }}
            src={require('@/assets/icons/apple-logo.png')}
            width={22}
            height={22}
            alt="Apple Logo"
          />
        </Button>
      </View>
      <View className="flex-row items-center w-full justify-between">
        <Stack height="$0.25" bg="black" width="$10" opacity={0.1} />
        <Paragraph size="$3" opacity={0.5}>
          or
        </Paragraph>
        <Stack height="$0.25" bg="black" width="$10" opacity={0.1} />
      </View>

      {/* email sign up option */}
      <Input
        autoCapitalize="none"
        placeholder="用户名/邮箱"
        onChangeText={(text) => {
          setEmail(text)
        }}
      />
      <Input
        autoCapitalize="none"
        placeholder="密码"
        onChangeText={(text) => {
          setPassword(text)
        }}
        textContentType="password"
        secureTextEntry
      />

      {/* sign up button */}
      <Button
        themeInverse
        onPress={() => {
          handleEmailWithPress(email, password)
        }}
        hoverStyle={{ opacity: 0.8 }}
        onHoverIn={() => { }}
        onHoverOut={() => { }}
        focusStyle={{ scale: 0.975 }}
      >
        {type === 'sign-up' ? '注册' : '登录'}
      </Button>

      <View className="flex-row">
        <Paragraph size="$2" marginRight="$2" opacity={0.4}>
          {type === 'sign-up' ? '已有账户?' : '没有账户?'}
        </Paragraph>
        <Link href={type === 'sign-up' ? '/sign-in' : '/sign-up'}>
          <Paragraph
            cursor="pointer"
            size="$2"
            fontWeight="700"
            opacity={0.5}
            hoverStyle={{ opacity: 0.4 }}
          >
            {type === 'sign-up' ? '登录' : '注册'}
          </Paragraph>
        </Link>
      </View>

      {/* forgot password */}
      {type === 'sign-in' && (
        <View className="flex-row mt-3">
          <Paragraph size="$2" marginRight="$2" opacity={0.4}>
            忘记密码?
          </Paragraph>
          <Link href="/(auth)/reset-password">
            <Paragraph
              cursor="pointer"
              size="$2"
              fontWeight="700"
              opacity={0.5}
              hoverStyle={{ opacity: 0.4 }}
            >
              重置密码
            </Paragraph>
          </Link>
        </View>
      )}
    </View>
  )
}
