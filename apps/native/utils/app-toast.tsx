import { Ionicons } from "@expo/vector-icons";
import {
	cn,
	Toast,
	type ToastComponentProps,
	type ToastShowConfig,
	type ToastShowOptions,
	type ToastVariant,
	useThemeColor,
	useToast,
} from "heroui-native";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

export type AppToastOptions = Omit<ToastShowConfig, "icon"> & {
	iconName?: IconName;
};

const TOAST_ICON_BY_VARIANT: Record<ToastVariant, IconName> = {
	accent: "sparkles",
	danger: "close-circle",
	default: "information-circle",
	success: "checkmark-circle",
	warning: "alert-circle",
};

const TOAST_ICON_BACKGROUND_CLASS_BY_VARIANT: Record<ToastVariant, string> = {
	accent: "bg-accent-soft",
	danger: "bg-danger-soft",
	default: "bg-content2",
	success: "bg-success-soft",
	warning: "bg-warning-soft",
};

const TOAST_ACCENT_CLASS_BY_VARIANT: Record<ToastVariant, string> = {
	accent: "bg-accent",
	danger: "bg-danger",
	default: "bg-muted",
	success: "bg-success",
	warning: "bg-warning",
};

function AppToastContent({
	options,
	props,
}: {
	options: AppToastOptions;
	props: ToastComponentProps;
}) {
	const variant = options.variant ?? "accent";
	const iconColor = useThemeColor(
		variant === "default" ? "muted" : `${variant}-soft-foreground`,
	);
	const iconName = options.iconName ?? TOAST_ICON_BY_VARIANT[variant];

	const handleActionPress = () => {
		options.onActionPress?.({
			hide: props.hide,
			show: props.show,
		});
	};

	return (
		<Toast
			{...props}
			variant={variant}
			placement={options.placement}
			isSwipeable={options.isSwipeable}
			animation={options.animation}
			className="flex-row items-start gap-3 overflow-hidden border border-border-secondary bg-surface px-4 py-3"
		>
			<View
				className={cn(
					"absolute top-0 bottom-0 left-0 w-1",
					TOAST_ACCENT_CLASS_BY_VARIANT[variant],
				)}
			/>
			<View
				className={cn(
					"mt-0.5 size-9 items-center justify-center rounded-full",
					TOAST_ICON_BACKGROUND_CLASS_BY_VARIANT[variant],
				)}
			>
				<Ionicons name={iconName} size={20} color={iconColor} />
			</View>
			<View className="min-w-0 flex-1 gap-0.5">
				{options.label ? (
					<Toast.Title className="pr-1">{options.label}</Toast.Title>
				) : null}
				{options.description ? (
					<Toast.Description>{options.description}</Toast.Description>
				) : null}
			</View>
			{options.actionLabel ? (
				<Toast.Action className="self-center" onPress={handleActionPress}>
					{options.actionLabel}
				</Toast.Action>
			) : (
				<Toast.Close className="-mt-1 -mr-2" />
			)}
		</Toast>
	);
}

export function useAppToast() {
	const { toast, ...rest } = useToast();

	const show = useCallback(
		(options: AppToastOptions | string | ToastShowOptions) => {
			if (typeof options === "string") {
				return toast.show({
					component: (props) => (
						<AppToastContent options={{ label: options }} props={props} />
					),
				});
			}

			if ("component" in options && options.component) {
				return toast.show(options);
			}

			return toast.show({
				duration: options.duration,
				id: options.id,
				onHide: options.onHide,
				onShow: options.onShow,
				component: (props) => (
					<AppToastContent options={options} props={props} />
				),
			});
		},
		[toast],
	);

	return {
		...rest,
		toast: {
			...toast,
			show,
		},
	};
}
