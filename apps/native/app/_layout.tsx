import "@/polyfills";
import "@/global.css";
import {
	Nunito_300Light,
	Nunito_400Regular,
	Nunito_500Medium,
	Nunito_600SemiBold,
	Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import {
	DarkTheme,
	DefaultTheme,
	ThemeProvider,
} from "expo-router/react-navigation";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { HeroUINativeProvider, useThemeColor } from "heroui-native";
import { type ReactNode, useCallback, useEffect, useMemo } from "react";
import { LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	KeyboardAvoidingView,
	KeyboardProvider,
} from "react-native-keyboard-controller";
import {
	SafeAreaProvider,
	useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useUniwind } from "uniwind";

import { AppLayout } from "@/components/shared/app-layout";
import { AnonymousSessionBridge } from "@/lib/anonymous-session-bridge";
import { PushNotificationBridge } from "@/lib/notifications/push-notification-bridge";
import { ReactNativeQueryProvider } from "@/lib/query/react-native-query";
import { useAppToast } from "@/utils/app-toast";
import { setRequestToastHandler } from "@/utils/request-toast";
import { getAppToastInsets } from "@/utils/toast-insets";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync().catch((): void => {});
LogBox.ignoreLogs([
	"React does not recognize the `accessibilityElementsHidden` prop",
	"React does not recognize the `importantForAccessibility` prop",
]);

function RequestToastBridge() {
	const { toast } = useAppToast();

	useEffect(() => {
		return setRequestToastHandler((options) => toast.show(options));
	}, [toast]);

	return null;
}

function AppContent() {
	const safeAreaInsets = useSafeAreaInsets();
	const backgroundColor = useThemeColor("background");
	const { theme } = useUniwind();
	const systemBackgroundColor = theme === "dark" ? "#121216" : "#fafafa";
	const navigationTheme = useMemo(() => {
		const baseTheme = theme === "dark" ? DarkTheme : DefaultTheme;

		return {
			...baseTheme,
			colors: {
				...baseTheme.colors,
				background: backgroundColor,
				card: backgroundColor,
			},
		};
	}, [backgroundColor, theme]);
	const toastInsets = getAppToastInsets(safeAreaInsets);
	useEffect(() => {
		SystemUI.setBackgroundColorAsync(systemBackgroundColor).catch(
			(): void => {},
		);
	}, [systemBackgroundColor]);
	const toastContentWrapper = useCallback(
		(children: ReactNode) => (
			<KeyboardAvoidingView
				behavior="padding"
				keyboardVerticalOffset={12}
				className="flex-1"
				style={{ pointerEvents: "box-none" }}
			>
				{children}
			</KeyboardAvoidingView>
		),
		[],
	);

	return (
		<KeyboardProvider>
			<HeroUINativeProvider
				config={{
					toast: {
						contentWrapper: toastContentWrapper,
						defaultProps: {
							isSwipeable: true,
							placement: "top",
						},
						insets: toastInsets,
						maxVisibleToasts: 2,
					},
				}}
			>
				<RequestToastBridge />
				<AnonymousSessionBridge />
				<PushNotificationBridge />
				<ThemeProvider value={navigationTheme}>
					<AppLayout>
						<Stack
							screenOptions={{
								contentStyle: { backgroundColor },
								headerShown: false,
							}}
						>
							<Stack.Screen
								name="note/[id]"
								options={{ animation: "fade", animationDuration: 260 }}
							/>
						</Stack>
					</AppLayout>
				</ThemeProvider>
			</HeroUINativeProvider>
		</KeyboardProvider>
	);
}

export default function Layout() {
	const [fontsLoaded, fontError] = useFonts({
		Nunito_300Light,
		Nunito_400Regular,
		Nunito_500Medium,
		Nunito_600SemiBold,
		Nunito_700Bold,
	});

	useEffect((): void => {
		if (fontsLoaded || fontError !== null) {
			SplashScreen.hideAsync().catch((): void => {});
		}
	}, [fontsLoaded, fontError]);
	if (!fontsLoaded && fontError === null) {
		return null;
	}

	return (
		<ReactNativeQueryProvider>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaProvider>
					<AppContent />
				</SafeAreaProvider>
			</GestureHandlerRootView>
		</ReactNativeQueryProvider>
	);
}
