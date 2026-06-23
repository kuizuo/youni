import "@/polyfills";
import "@/global.css";
import {
	Nunito_300Light,
	Nunito_400Regular,
	Nunito_500Medium,
	Nunito_600SemiBold,
	Nunito_700Bold,
} from "@expo-google-fonts/nunito";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native";
import { type ReactNode, useCallback, useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
	KeyboardAvoidingView,
	KeyboardProvider,
} from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppThemeProvider } from "@/lib/contexts/app-theme-context";
import { useAppToast } from "@/utils/app-toast";
import { queryClient } from "@/utils/orpc";
import { setRequestToastHandler } from "@/utils/request-toast";

export const unstable_settings = {
	initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync().catch((): void => {});

function StackLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="note/[id]" />
			<Stack.Screen name="user/[id]" />
			<Stack.Screen name="preview" />
			<Stack.Screen name="publish" />
			<Stack.Screen name="modal" options={{ presentation: "modal" }} />
		</Stack>
	);
}

function RequestToastBridge() {
	const { toast } = useAppToast();

	useEffect(() => {
		return setRequestToastHandler((options) => toast.show(options));
	}, [toast]);

	return null;
}

export default function Layout() {
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
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaProvider>
					<KeyboardProvider>
						<AppThemeProvider>
							<HeroUINativeProvider
								config={{
									toast: {
										contentWrapper: toastContentWrapper,
										defaultProps: {
											isSwipeable: true,
											placement: "bottom",
										},
										insets: {
											bottom: 92,
											left: 16,
											right: 16,
											top: 12,
										},
										maxVisibleToasts: 2,
									},
								}}
							>
								<RequestToastBridge />
								<StackLayout />
							</HeroUINativeProvider>
						</AppThemeProvider>
					</KeyboardProvider>
				</SafeAreaProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	);
}
