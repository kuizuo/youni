import { useEffect, useState } from 'react'
import { Button, Form, Spinner, YStack } from 'tamagui'

export function CreateScreen() {
  const [status, setStatus] = useState<'off' | 'submitting' | 'submitted'>('off')

  const handleSubmit = () => {

  }

  useEffect(() => {
    if (status === 'submitting') {
      const timer = setTimeout(() => setStatus('off'), 2000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [status])

  return (
    <YStack>
      <Form
        ai="center"
        minWidth={300}
        gap="$2"
        onSubmit={handleSubmit}
        borderWidth={1}
        br="$4"
        bg="$background"
        borderColor="$borderColor"
        p="$8"
      >

        <Form.Trigger asChild disabled={status !== 'off'}>
          <Button icon={status === 'submitting' ? () => <Spinner /> : undefined}>
            Submit
          </Button>
        </Form.Trigger>
      </Form>
    </YStack>
  )
}
