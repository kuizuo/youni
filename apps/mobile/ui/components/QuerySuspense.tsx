import { QueryErrorResetBoundary } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { isObjectLike, isString } from 'lodash-es'
import type { ComponentType, FC, ReactNode } from 'react'
import { Fragment, Suspense } from 'react'
import type { ErrorBoundaryProps, FallbackProps } from 'react-error-boundary'
import { ErrorBoundary } from 'react-error-boundary'
import { Button } from '@gluestack-ui/themed'
import { LoadingIndicator } from './LoadingIndicator'
import { Text, View } from '@/ui'

export function FallbackComponent({
  error,
  resetErrorBoundary,
}: FallbackProps) {
  const message
    = isObjectLike(error) && isString(error.message) && !!error.message
      ? error.message
      : null

  return (
    <View>
      {message
        ? (
          <Fragment>
            <Text
              selectable
            >
              {(error as AxiosError).code
                ? (error as AxiosError).code || error.name
                : error.name || '出现错误了'}
            </Text>
            <Text
              selectable
            >
              {error.message}
            </Text>
          </Fragment>
          )
        : (
          <Text
            selectable
          >
            出现错误了
          </Text>
          )}
      <Button
        onPress={resetErrorBoundary}
        size="lg"
      >
        <Text>重试</Text>
      </Button>
    </View>
  )
}

export type QuerySuspenseProps<P> = Omit<
  Partial<ErrorBoundaryProps>,
  'fallbackRender'
> & {
  LoadingComponent?: FC
  loadingRender?: (componentsProps: P) => ReactNode
  fallbackRender?: (props: FallbackProps & { componentsProps: P }) => ReactNode
  loading?: ReactNode
  children?: ReactNode
  componentsProps?: P
}

export function QuerySuspense<P = void>({
  LoadingComponent,
  loadingRender,
  loading,
  children,
  componentsProps,
  ...rest
}: QuerySuspenseProps<P>) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        // @ts-expect-error
        <ErrorBoundary
          onReset={reset}
          FallbackComponent={
            !rest.fallback && !rest.fallbackRender && !rest.FallbackComponent
              ? FallbackComponent
              : undefined
          }
          fallbackRender={
            rest.fallbackRender
              ? ((props =>
                  rest.fallbackRender?.({
                    ...props,
                    componentsProps: componentsProps!,
                  })) as ErrorBoundaryProps['fallbackRender'] as any)
              : null
          }
          {...rest}
        >
          <Suspense
            fallback={
              LoadingComponent
                ? (
                  <LoadingComponent />
                  )
                : loadingRender
                  ? (
                      loadingRender(componentsProps!)
                    )
                  : (
                      loading ?? <LoadingIndicator />
                    )
            }
          >
            {children}
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}

export function withQuerySuspense<P>(
  Component: ComponentType<P>,
  querySuspenseProps?: QuerySuspenseProps<P>,
): ComponentType<P> {
  const Wrapped: ComponentType<P> = (props) => {
    return (
      <QuerySuspense {...querySuspenseProps} componentsProps={props}>
        {/* @ts-expect-error */}
        <Component {...props} />
      </QuerySuspense>
    )
  }

  // Format for display in DevTools
  const name = Component.displayName || Component.name || 'Unknown'
  Wrapped.displayName = `withQuerySuspense(${name})`

  return Wrapped
}
