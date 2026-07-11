import { Button } from "heroui-native";
import Svg, { Path } from "react-native-svg";

export function GoogleAuthButton({
	isDisabled = false,
	label,
	onPress,
}: {
	readonly isDisabled?: boolean;
	readonly label: string;
	readonly onPress: () => Promise<void> | void;
}) {
	return (
		<Button
			accessibilityLabel="使用 Google 登录"
			className="rounded-full"
			feedbackVariant="scale-ripple"
			isDisabled={isDisabled}
			size="md"
			variant="outline"
			onPress={onPress}
		>
			<GoogleLogo />
			<Button.Label>{label}</Button.Label>
		</Button>
	);
}

function GoogleLogo() {
	return (
		<Svg accessibilityElementsHidden height={18} viewBox="0 0 48 48" width={18}>
			<Path
				d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
				fill="#EA4335"
			/>
			<Path
				d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
				fill="#4285F4"
			/>
			<Path
				d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.006 24.006 0 0 0 0 21.56l7.98-6.19z"
				fill="#FBBC05"
			/>
			<Path
				d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
				fill="#34A853"
			/>
		</Svg>
	);
}
