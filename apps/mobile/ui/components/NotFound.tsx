import { Link } from 'expo-router'
import { StyleSheet } from 'react-native'

import { Text, View } from '@/ui'

interface Props {
  title: string
}

export default function NotFound({ title }: Props) {
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>

        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>返回到首页</Text>
        </Link>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#2e78b7',
  },
})
