import { env } from "@youni/env/native";
import { Typography, useThemeColor } from "heroui-native";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { runAccountAuthentication } from "@/lib/account-authentication";
import { authClient } from "@/lib/auth-client";
import { useAppToast } from "@/utils/app-toast";
import {
	isRequestTimeoutError,
	REQUEST_TIMEOUT_MESSAGE,
} from "@/utils/request-timeout";

type GoogleSignInProps = {
	onAuthenticated?: () => Promise<void> | void;
};

type GoogleIdentity = {
	accounts: {
		id: {
			initialize: (options: {
				callback: (response: { credential?: string }) => void;
				client_id: string;
			}) => void;
			renderButton: (
				parent: HTMLElement,
				options: {
					locale: string;
					shape: string;
					size: string;
					text: string;
					theme: string;
					type: string;
					width: number;
				},
			) => void;
		};
	};
};

let googleIdentityPromise: Promise<GoogleIdentity> | undefined;

function loadGoogleIdentity() {
	const google = (window as typeof window & { google?: GoogleIdentity }).google;
	if (google) return Promise.resolve(google);

	googleIdentityPromise ??= new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.async = true;
		script.src = "https://accounts.google.com/gsi/client";
		script.onload = () => {
			const loadedGoogle = (
				window as typeof window & { google?: GoogleIdentity }
			).google;
			if (loadedGoogle) resolve(loadedGoogle);
			else reject(new Error("Google 登录加载失败，请稍后重试"));
		};
		script.onerror = () => reject(new Error("Google 登录加载失败，请稍后重试"));
		document.head.appendChild(script);
	});

	return googleIdentityPromise;
}

export function GoogleSignIn({ onAuthenticated }: GoogleSignInProps) {
	const { toast } = useAppToast();
	const isLastUsedMethod = authClient.isLastUsedLoginMethod("google");
	const dangerColor = useThemeColor("danger");
	const buttonContainer = useRef<View>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		const clientId = env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
		const container = buttonContainer.current as unknown as HTMLElement | null;
		if (!clientId || !container) {
			setErrorMessage("Google 登录还没有配置");
			return;
		}

		let cancelled = false;
		loadGoogleIdentity()
			.then((google) => {
				if (cancelled) return;

				google.accounts.id.initialize({
					client_id: clientId,
					callback: async ({ credential }) => {
						if (!credential) return;

						setErrorMessage(null);
						setIsSubmitting(true);
						try {
							const error = await runAccountAuthentication({
								authenticate: () =>
									authClient.signIn.social({
										provider: "google",
										idToken: { token: credential },
									}),
								onAuthenticated,
							});
							if (error) throw new Error(error.message);
						} catch (error) {
							const message = isRequestTimeoutError(error)
								? REQUEST_TIMEOUT_MESSAGE
								: error instanceof Error
									? error.message
									: "Google 登录失败，请稍后重试";
							setErrorMessage(message);
							toast.show({ variant: "danger", label: message });
						} finally {
							setIsSubmitting(false);
						}
					},
				});
				container.replaceChildren();
				google.accounts.id.renderButton(container, {
					type: "standard",
					theme: "outline",
					size: "large",
					shape: "pill",
					text: "signin_with",
					width: 320,
					locale: "zh_CN",
				});
			})
			.catch((error: unknown) => {
				if (cancelled) return;
				const message =
					error instanceof Error
						? error.message
						: "Google 登录加载失败，请稍后重试";
				setErrorMessage(message);
			});

		return () => {
			cancelled = true;
		};
	}, [onAuthenticated, toast]);

	return (
		<View className="items-center gap-2">
			<View ref={buttonContainer} />
			{isLastUsedMethod ? (
				<Typography.Paragraph type="body-sm" color="muted">
					上次使用 Google 登录
				</Typography.Paragraph>
			) : null}
			{isSubmitting ? (
				<Typography.Paragraph type="body-sm" color="muted">
					正在使用 Google 登录
				</Typography.Paragraph>
			) : null}
			{errorMessage ? (
				<Typography.Paragraph type="body-sm" style={{ color: dangerColor }}>
					{errorMessage}
				</Typography.Paragraph>
			) : null}
		</View>
	);
}
